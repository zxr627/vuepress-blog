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
cleanup_archive=""

cleanup_activation() {
  [[ -z "$temporary_dir" ]] || rm -rf -- "$temporary_dir" || true
  [[ -z "$cleanup_archive" ]] || rm -f -- "$cleanup_archive" || true
}

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
  local entry_type

  while IFS= read -r entry; do
    entry="${entry#./}"
    case "$entry" in
      "" | "." | */) ;;
      /* | ".." | ../* | */../* | */..)
        fail "unsafe archive path: ${entry}"
        ;;
    esac
  done < <(tar -tzf "$archive")

  while IFS= read -r entry; do
    entry_type="${entry:0:1}"
    case "$entry_type" in
      "-" | "d") ;;
      *)
        fail "unsafe archive entry type: ${entry_type}"
        ;;
    esac
  done < <(tar -tvzf "$archive")
}

validate_release_files() {
  local release_dir="$1"
  local path
  local required
  local resolved
  local release_root

  release_root="$(readlink -f "$release_dir")"

  while IFS= read -r -d '' path; do
    [[ ! -L "$path" ]] || fail "release contains a symbolic link: ${path}"
    [[ -d "$path" || -f "$path" ]] ||
      fail "release contains a special file: ${path}"
    resolved="$(readlink -f "$path")"
    [[ "$resolved" == "$release_root"/* ]] ||
      fail "release path escapes its root: ${path}"
  done < <(find -P "$release_dir" -mindepth 1 -print0)

  for required in "${required_files[@]}"; do
    [[ -f "${release_dir}/${required}" && ! -L "${release_dir}/${required}" ]] ||
      fail "missing required file: ${required}"
  done
}

prune_releases() {
  local -a protected_releases=("$@")
  local -a releases=()
  local count
  local index
  local protected
  local release
  local should_keep

  while IFS= read -r release; do
    releases+=("$release")
  done < <(ls -1dt "${releases_dir}"/* 2>/dev/null || true)

  count="${#releases[@]}"

  for ((index = count - 1; index >= 0 && count > 5; index -= 1)); do
    release="${releases[$index]}"
    should_keep=false

    for protected in "${protected_releases[@]}"; do
      if [[ -n "$protected" && "$release" == "$protected" ]]; then
        should_keep=true
        break
      fi
    done

    if [[ "$should_keep" == false ]]; then
      rm -rf -- "$release"
      count=$((count - 1))
    fi
  done
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
  if [[ "$(dirname "$archive")" == "$(readlink -f "$incoming_dir")" ]]; then
    cleanup_archive="$archive"
  fi
  release_dir="${releases_dir}/${release_name}"
  temporary_dir="${releases_dir}/.${release_name}.tmp.$$"
  rm -rf "$temporary_dir"
  mkdir -p "$temporary_dir"
  trap cleanup_activation EXIT

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
  fi

  prune_releases "$release_dir" "${previous_target:-}"
  if [[ -n "${previous_target:-}" ]]; then
    replace_link "$previous_target" "$previous_link"
  fi
  replace_link "$release_dir" "$current_link"
  temporary_dir=""
  cleanup_activation
  cleanup_archive=""
  trap - EXIT
  printf 'activated %s\n' "$release_name" || true
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
