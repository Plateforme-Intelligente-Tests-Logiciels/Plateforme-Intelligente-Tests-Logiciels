"""add missing notification types

Revision ID: s4t5u6v7w8x9
Revises: r3s4t5u6v7w8
Create Date: 2026-06-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "s4t5u6v7w8x9"
down_revision: Union[str, Sequence[str], None] = "r3s4t5u6v7w8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

MISSING_VALUES = [
    "USER_STORY_READY_FOR_TEST",
    "USER_STORY_NEEDS_FIX",
    "TEST_FAILED",
    "TEST_PASSED",
    "SPRINT_STARTED",
    "SPRINT_ENDED",
    "REPORT_GENERATED",
    "ANOMALY_CREATED",
    "VALIDATION_REQUIRED",
    "RECOMMENDATION_AVAILABLE",
]


def _resolve_enum_name() -> str | None:
    bind = op.get_bind()
    candidates = ("typenotification", "type_notification", "notification_type")
    for name in candidates:
        found = bind.execute(
            sa.text(
                """
                SELECT 1
                FROM pg_type t
                JOIN pg_namespace n ON n.oid = t.typnamespace
                WHERE t.typname = :name AND n.nspname = current_schema()
                """
            ),
            {"name": name},
        ).scalar()
        if found:
            return name
    return None


def upgrade() -> None:
    enum_name = _resolve_enum_name()
    if not enum_name:
        raise RuntimeError("Notification enum type not found in current schema.")

    for value in MISSING_VALUES:
        op.execute(sa.text(f"ALTER TYPE {enum_name} ADD VALUE IF NOT EXISTS '{value}'"))


def downgrade() -> None:
    pass
