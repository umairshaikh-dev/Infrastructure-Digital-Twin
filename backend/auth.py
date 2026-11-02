"""Small standard-library authentication layer for the Digital Twin prototype.

For production deployments, use HTTPS and consider a mature identity provider.
"""
import base64
import hashlib
import hmac
import json
import os
import sqlite3
import time
from pathlib import Path
from typing import Any

AUTH_DB = Path(__file__).with_name("auth_users.db")
TOKEN_TTL_SECONDS = 12 * 60 * 60
# Set DIGITAL_TWIN_SECRET to a long random value in the environment for deployments.
TOKEN_SECRET = os.environ.get("DIGITAL_TWIN_SECRET", "CHANGE-ME-development-only-secret")


def _db() -> sqlite3.Connection:
    conn = sqlite3.connect(AUTH_DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_auth_db() -> None:
    with _db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS auth_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at INTEGER NOT NULL
            )
        """)


def _password_hash(password: str, salt: bytes | None = None) -> str:
    salt = salt or os.urandom(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 310_000)
    return f"{base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(derived).decode()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt_text, expected_text = stored.split("$", 1)
        salt = base64.urlsafe_b64decode(salt_text.encode())
        expected = base64.urlsafe_b64decode(expected_text.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 310_000)
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def register_user(email: str, password: str) -> dict[str, str]:
    email = email.strip().lower()
    if len(email) > 254 or "@" not in email or any(c.isspace() for c in email):
        raise ValueError("Enter a valid email address.")
    if len(password) < 12:
        raise ValueError("Password must be at least 12 characters.")
    if len(password) > 256:
        raise ValueError("Password is too long.")
    password_hash = _password_hash(password)
    try:
        with _db() as conn:
            conn.execute(
                "INSERT INTO auth_users(email, password_hash, created_at) VALUES (?, ?, ?)",
                (email, password_hash, int(time.time())),
            )
    except sqlite3.IntegrityError:
        raise ValueError("An account with this email already exists.")
    return {"email": email, "role": "user"}


def verify_user(email: str, password: str) -> dict[str, str] | None:
    with _db() as conn:
        row = conn.execute(
            "SELECT email, password_hash FROM auth_users WHERE email = ?",
            (email.strip().lower(),),
        ).fetchone()
    if row and _verify_password(password, row["password_hash"]):
        return {"email": row["email"], "role": "user"}
    return None


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def create_token(subject: str, role: str = "user") -> str:
    now = int(time.time())
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64url(json.dumps({
        "sub": subject, "role": role, "iat": now, "exp": now + TOKEN_TTL_SECONDS
    }, separators=(",", ":")).encode())
    signing_input = f"{header}.{payload}".encode()
    signature = _b64url(hmac.new(TOKEN_SECRET.encode(), signing_input, hashlib.sha256).digest())
    return f"{header}.{payload}.{signature}"


def verify_token(token: str) -> dict[str, Any] | None:
    try:
        header, payload, signature = token.split(".")
        signing_input = f"{header}.{payload}".encode()
        expected = _b64url(hmac.new(TOKEN_SECRET.encode(), signing_input, hashlib.sha256).digest())
        if not hmac.compare_digest(signature, expected):
            return None
        decoded = base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4))
        claims = json.loads(decoded)
        if not isinstance(claims.get("exp"), int) or claims["exp"] <= int(time.time()):
            return None
        if not claims.get("sub") or claims.get("role") not in ("user", "demo"):
            return None
        return claims
    except (ValueError, TypeError, json.JSONDecodeError):
        return None
