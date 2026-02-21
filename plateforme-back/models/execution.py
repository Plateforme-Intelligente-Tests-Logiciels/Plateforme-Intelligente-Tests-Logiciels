from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


class ExecutionTest(Base):
    __tablename__ = "execution_test"

    id = Column(Integer, primary_key=True)
    dateExecution = Column(DateTime, default=datetime.utcnow)
    statut = Column(String)
    dureeExecution = Column(Integer)  # en secondes

    test_id = Column(Integer, ForeignKey("test.id"))
    executeurId = Column(Integer, ForeignKey("utilisateur.id"))

    # Relations
    test = relationship("Test", back_populates="executions")
    executeur = relationship("Utilisateur", back_populates="executions", foreign_keys=[executeurId])
    resultat = relationship("ResultatTest", back_populates="execution", uselist=False, cascade="all, delete-orphan")


class ResultatTest(Base):
    __tablename__ = "resultat_test"

    id = Column(Integer, primary_key=True)
    statut = Column(String)
    messageErreur = Column(Text)
    logs = Column(Text)
    captureEcran = Column(String)  # chemin vers le fichier
    commentaire = Column(Text)

    execution_id = Column(Integer, ForeignKey("execution_test.id"))

    # Relations
    execution = relationship("ExecutionTest", back_populates="resultat")
    anomalies = relationship("Anomalie", back_populates="resultat", cascade="all, delete-orphan")

