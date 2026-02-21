from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


class RapportQA(Base):
    __tablename__ = "rapport_qa"

    id = Column(Integer, primary_key=True)
    dateGeneration = Column(DateTime, default=datetime.utcnow)
    statut = Column(String)
    tauxReussite = Column(Float)
    nombreTestsExecutes = Column(Integer, default=0)
    nombreTestsReussis = Column(Integer, default=0)
    nombreTestsEchoues = Column(Integer, default=0)
    recommandations = Column(Text)

    sprintId = Column(Integer, ForeignKey("sprint.id"))

    # Relations
    sprint = relationship("Sprint", back_populates="rapport_qa")
    indicateurs = relationship("IndicateurQualite", back_populates="rapport", uselist=False, cascade="all, delete-orphan")
    recommandations_qualite = relationship("RecommandationQualite", back_populates="rapport", cascade="all, delete-orphan")


class IndicateurQualite(Base):
    __tablename__ = "indicateur_qualite"

    id = Column(Integer, primary_key=True)
    tauxCouverture = Column(Float)
    tauxReussite = Column(Float)
    nombreAnomalies = Column(Integer, default=0)
    nombreAnomaliesCritiques = Column(Integer, default=0)
    indiceQualite = Column(Float)
    tendance = Column(String)

    rapportId = Column(Integer, ForeignKey("rapport_qa.id"))

    # Relations
    rapport = relationship("RapportQA", back_populates="indicateurs")


class RecommandationQualite(Base):
    __tablename__ = "recommandation_qualite"

    id = Column(Integer, primary_key=True)
    titre = Column(String)
    description = Column(Text)
    categorie = Column(String)
    priorite = Column(String)
    impact = Column(Float)
    statut = Column(String)

    rapportId = Column(Integer, ForeignKey("rapport_qa.id"))

    # Relations
    rapport = relationship("RapportQA", back_populates="recommandations_qualite")
