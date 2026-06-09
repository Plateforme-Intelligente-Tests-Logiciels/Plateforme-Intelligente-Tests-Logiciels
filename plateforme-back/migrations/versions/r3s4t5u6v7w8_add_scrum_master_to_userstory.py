"""add scrum master to userstory

Revision ID: r3s4t5u6v7w8
Revises: q2r3s4t5u6v7
Create Date: 2026-06-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "r3s4t5u6v7w8"
down_revision: Union[str, Sequence[str], None] = "q2r3s4t5u6v7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    op.execute('ALTER TABLE userstory ADD COLUMN IF NOT EXISTS "scrumMasterId" INTEGER')

    fk_exists = bind.execute(
        sa.text("SELECT 1 FROM pg_constraint WHERE conname = 'userstory_scrumMasterId_fkey'")
    ).scalar()
    if not fk_exists:
        op.create_foreign_key(
            "userstory_scrumMasterId_fkey",
            "userstory",
            "utilisateur",
            ["scrumMasterId"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    bind = op.get_bind()

    fk_exists = bind.execute(
        sa.text("SELECT 1 FROM pg_constraint WHERE conname = 'userstory_scrumMasterId_fkey'")
    ).scalar()
    if fk_exists:
        op.drop_constraint("userstory_scrumMasterId_fkey", "userstory", type_="foreignkey")

    op.execute('ALTER TABLE userstory DROP COLUMN IF EXISTS "scrumMasterId"')
