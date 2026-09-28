#!/usr/bin/env python3
"""URL gate for the testimonies form. Mirrors the check in js/scripts.js."""
import re
import sys

PATTERN = re.compile(r"^https://([a-z0-9-]+\.)?substack\.com/", re.I)

OK = [
    "https://peterchon.substack.com/p/the-idolatry-of-faith",
    "https://substack.com/home",
]
BAD = [
    "http://peterchon.substack.com/p/the-idolatry-of-faith",
    "https://example.com/p/post",
    "https://evil.com/?u=https://substack.com",
    "",
]


SLUG = re.compile(r"/p/([a-z0-9-]+)", re.I)


def slug_from_url(url: str) -> str:
    match = SLUG.search(url or "")
    return match.group(1) if match else ""


def main() -> int:
    failed = 0
    for url in OK:
        if not PATTERN.search(url):
            print("expected allow:", url)
            failed += 1
    for url in BAD:
        if PATTERN.search(url):
            print("expected reject:", url)
            failed += 1
    if slug_from_url("https://peterchon.substack.com/p/the-idolatry-of-faith") != "the-idolatry-of-faith":
        print("expected slug the-idolatry-of-faith")
        failed += 1
    if slug_from_url("https://example.com/about"):
        print("expected empty slug")
        failed += 1
    if failed:
        print(f"{failed} checks failed")
        return 1
    print("ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
