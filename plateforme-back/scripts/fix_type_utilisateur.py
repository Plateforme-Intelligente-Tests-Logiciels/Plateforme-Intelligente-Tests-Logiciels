from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# Ensure the project root is on sys.path so "models" imports work
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.cahier_test_global import CasTest
from models.scrum import UserStory
from models.user import Utilisateur


def _format_assignee(user: Utilisateur) -> str:
    return f"{user.nom} ({user.email})"


def _resolve_assignee(user_story: Optional[UserStory]) -> Optional[Utilisateur]:
    if not user_story:
        return None
    # Prefer tester, then developer, then assignee.
    if user_story.testerId:
        return user_story.tester
    if user_story.developerId:
        return user_story.developer
    if user_story.assigneeId:
        return user_story.assignee
    return None


def main() -> None:
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in .env")

    engine = create_engine(database_url)
    updated = 0
    skipped = 0

    with Session(engine) as session:
        cases = (
            session.query(CasTest)
            .join(UserStory, CasTest.user_story_id == UserStory.id)
            .all()
        )

        for case in cases:
            raw = (case.type_utilisateur or "").strip().lower()
            if raw not in {"tester", "testeur", "testeur qa", "qa tester"}:
                continue

            assignee = _resolve_assignee(case.user_story)
            if not assignee or not assignee.email:
                skipped += 1
                continue

            case.type_utilisateur = _format_assignee(assignee)
            updated += 1

        session.commit()

    print(f"Updated type_utilisateur for {updated} cases.")
    print(f"Skipped {skipped} cases (no tester/developer/assignee).")


if __name__ == "__main__":
    main()
