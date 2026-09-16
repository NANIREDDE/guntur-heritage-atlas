"""Authentication boundary for researcher/admin actions.

No credentials are stored in this project yet. This module documents the security
boundary so future authentication can use hashed passwords or an external identity
provider without exposing secrets in source control.
"""

from dataclasses import dataclass

@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    role: str


def require_researcher(user: AuthenticatedUser) -> AuthenticatedUser:
    if user.role not in {"researcher", "admin"}:
        raise PermissionError("Researcher access required")
    return user
