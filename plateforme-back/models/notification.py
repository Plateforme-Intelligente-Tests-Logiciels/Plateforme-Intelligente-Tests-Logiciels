from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum
from db.database import Base


class TypeNotification(str, Enum):
    TEST_FAILED = "TEST_FAILED"
    TEST_PASSED = "TEST_PASSED"
    SPRINT_STARTED = "SPRINT_STARTED"
    SPRINT_ENDED = "SPRINT_ENDED"
    REPORT_GENERATED = "REPORT_GENERATED"
    ANOMALY_CREATED = "ANOMALY_CREATED"
    VALIDATION_REQUIRED = "VALIDATION_REQUIRED"
    RECOMMENDATION_AVAILABLE = "RECOMMENDATION_AVAILABLE"


class Notification(Base):
    __tablename__ = "notification"

    id = Column(Integer, primary_key=True)
    titre = Column(String)
    message = Column(Text)
    type = Column(SQLEnum(TypeNotification))
    dateEnvoi = Column(DateTime, default=datetime.utcnow)
    lue = Column(Boolean, default=False)
    priorite = Column(String)

    destinataireId = Column(Integer, ForeignKey("utilisateur.id"))

    # Relations
    destinataire = relationship("Utilisateur", back_populates="notifications", foreign_keys=[destinataireId])
