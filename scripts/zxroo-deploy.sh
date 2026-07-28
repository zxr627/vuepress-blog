#!/usr/bin/env bash

set -euo pipefail

deploy_root="${ZXROO_DEPLOY_ROOT:-/var/www/zxroo}"
incoming_dir="${deploy_root}/incoming"
releases_dir="${deploy_root}/releases"
current_link="${deploy_root}/current"
previous_link="${deploy_root}/previous"
required_files=(
  "index.html"
  "404.html"
  "robots.txt"
  "sitemap.xml"
  "0752e0217f4f06edf6c758d09659d6da.txt"
)
temporary_dir=""

fail() {
  printf 'zxroo-deploy: %s\n' "$*" >&2
  exit 1
}

replace_link() {
  local target="$1"
  local link="$2"
  local next_link="${link}.next"

  rm -f "$next_link"
  ln -s "$target" "$next_link"
  mv -Tf "$next_link" "$link"
}

validate_release_name() {
  local release_name="$1"
  [[ "$release_name" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$ ]] ||
    fail "invalid release name: ${release_name}"
}

validate_archive_paths() {
  local archive="$1"
  local entry

  while IFS= read -r entry; do
    entry="${entry#./}"
    case "$entry" in
      "" | "." | */) ;;
      /* | ".." | ../* | */../* | */..)
        fail "unsafe archive path: ${entry}"
        ;;
    esac
  done < <(tar -tzf "$archive")
}

validate_release_files() {
  local release_dir="$1"
  local required

  for required in "${required_files[@]}"; do
    [[ -f "${release_dir}/${required}" ]] ||
      fail "missing required file: ${required}"
  done
}

prune_releases() {
  local -a releases=()
  local release

  while IFS= read -r release; do
    releases+=("$release")
  done < <(ls -1dt "${releases_dir}"/* 2>/dev/null || true)

  if ((${#releases[@]} > 5)); then
    rm -rf -- "${releases[@]:5}"
  fi
}

activate_release() {
  local release_name="${1:-}"
  local archive="${2:-}"
  local release_dir
  local previous_target

  [[ -n "$release_name" && -n "$archive" ]] ||
    fail "usage: zxroo-deploy activate <release-name> <archive-path>"
  validate_release_name "$release_name"
  [[ -f "$archive" ]] || fail "archive not found: ${archive}"

  mkdir -p "$incoming_dir" "$releases_dir"
  archive="$(readlink -f "$archive")"
  release_dir="${releases_dir}/${release_name}"
  temporary_dir="${releases_dir}/.${release_name}.tmp.$$"
  rm -rf "$temporary_dir"
  mkdir -p "$temporary_dir"
  trap '[[ -n "${temporary_dir:-}" ]] && rm -rf "$temporary_dir"' EXIT

  validate_archive_paths "$archive"
  tar -xzf "$archive" -C "$temporary_dir"
  validate_release_files "$temporary_dir"

  find "$temporary_dir" -type d -exec chmod 755 {} +
  find "$temporary_dir" -type f -exec chmod 644 {} +

  if [[ -e "$release_dir" ]]; then
    rm -rf "$temporary_dir"
    validate_release_files "$release_dir"
  else
    mv "$temporary_dir" "$release_dir"
  fi
  touch "$release_dir"

  if [[ -L "$current_link" ]]; then
    previous_target="$(readlink "$current_link")"
    replace_link "$previous_target" "$previous_link"
  fi

  replace_link "$release_dir" "$current_link"
  prune_releases
  if [[ "$(dirname "$archive")" == "$(readlink -f "$incoming_dir")" ]]; then
    rm -f -- "$archive"
  fi
  temporary_dir=""
  trap - EXIT
  printf 'activated %s\n' "$release_name"
}

rollback_release() {
  local current_target
  local previous_target

  [[ -L "$current_link" ]] || fail "current release is not configured"
  [[ -L "$previous_link" ]] || fail "previous release is not configured"

  current_target="$(readlink "$current_link")"
  previous_target="$(readlink "$previous_link")"
  [[ -d "$previous_target" ]] ||
    fail "previous release does not exist: ${previous_target}"

  replace_link "$previous_target" "$current_link"
  replace_link "$current_target" "$previous_link"
  printf 'rolled back to %s\n' "$(basename "$previous_target")"
}

case "${1:-}" in
  activate)
    shift
    activate_release "$@"
    ;;
  rollback)
    shift
    (($# == 0)) || fail "usage: zxroo-deploy rollback"
    rollback_release
    ;;
  *)
    fail "usage: zxroo-deploy {activate <release-name> <archive-path>|rollback}"
    ;;
esac
