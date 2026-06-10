"""fix cascade on indicateur_qualite and recommandation_qualite

Revision ID: t5u6v7w8x9y0
Revises: s4t5u6v7w8x9
Create Date: 2026-06-11 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "t5u6v7w8x9y0"
down_revision: Union[str, Sequence[str], None] = "s4t5u6v7w8x9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()

    # ── indicateur_qualite ────────────────────────────────────────────────────
    iq_fk = bind.execute(
        sa.text(
            "SELECT conname FROM pg_constraint "
            "WHERE conrelid = 'indicateur_qualite'::regclass AND contype = 'f'"
        )
    ).fetchall()
    for (name,) in iq_fk:
        op.drop_constraint(name, "indicateur_qualite", type_="foreignkey")

    op.create_foreign_key(
        "fk_indicateur_qualite_rapport",
        "indicateur_qualite",
        "rapport_qa",
        ["rapportId"],
        ["id"],
        ondelete="CASCADE",
    )

    # ── recommandation_qualite ────────────────────────────────────────────────
    rq_fk = bind.execute(
        sa.text(
            "SELECT conname FROM pg_constraint "
            "WHERE conrelid = 'recommandation_qualite'::regclass AND contype = 'f'"
        )
    ).fetchall()
    for (name,) in rq_fk:
        op.drop_constraint(name, "recommandation_qualite", type_="foreignkey")

    op.create_foreign_key(
        "fk_recommandation_qualite_rapport",
        "recommandation_qualite",
        "rapport_qa",
        ["rapportId"],
        ["id"],
        ondelete="CASCADE",
    )


def downgrade() -> None:
    bind = op.get_bind()

    iq_fk = bind.execute(
        sa.text(
            "SELECT conname FROM pg_constraint "
            "WHERE conrelid = 'indicateur_qualite'::regclass AND contype = 'f'"
        )
    ).fetchall()
    for (name,) in iq_fk:
        op.drop_constraint(name, "indicateur_qualite", type_="foreignkey")

    op.create_foreign_key(
        "fk_indicateur_qualite_rapport",
        "indicateur_qualite",
        "rapport_qa",
        ["rapportId"],
        ["id"],
    )

    rq_fk = bind.execute(
        sa.text(
            "SELECT conname FROM pg_constraint "
            "WHERE conrelid = 'recommandation_qualite'::regclass AND contype = 'f'"
        )
    ).fetchall()
    for (name,) in rq_fk:
        op.drop_constraint(name, "recommandation_qualite", type_="foreignkey")

    op.create_foreign_key(
        "fk_recommandation_qualite_rapport",
        "recommandation_qualite",
        "rapport_qa",
        ["rapportId"],
        ["id"],
    )
