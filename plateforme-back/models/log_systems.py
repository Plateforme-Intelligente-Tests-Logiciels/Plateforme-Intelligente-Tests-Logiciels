from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


class LogSystems(Base):
    __tablename__ = "log_systems"

    id = Column(Integer, primary_key=True)
    niveau = Column(String)
    message = Column(Text)
    date_time = Column(DateTime, default=datetime.utcnow)
    source = Column(String)
    details = Column(Text)


class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    entityType = Column(String)
    entityId = Column(Integer)
    changes = Column(Text)
    ipAddress = Column(String)
    userAgent = Column(String)

    userId = Column(Integer, ForeignKey("utilisateur.id"))

    # Relations
    user = relationship("Utilisateur", back_populates="audit_logs", foreign_keys=[userId])

    



