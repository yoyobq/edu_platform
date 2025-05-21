import React from 'react';

interface InfoCardProps {
  title: string;
  index: number;
  desc: string;
  href: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, index, desc }) => {
  return (
    <div className="info-card">
      <div className="card-decoration"></div>

      <div className="info-card-header">
        <div className="info-card-icon">{index}</div>
        <div className="info-card-title">{title}</div>
      </div>
      <div className="info-card-content">{desc}</div>
    </div>
  );
};

export default InfoCard;
