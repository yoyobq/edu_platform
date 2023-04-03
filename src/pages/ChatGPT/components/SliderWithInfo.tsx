import { Slider, Typography } from 'antd';
import React from 'react';

interface Props {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  step: number;
  description?: string;
  onChange: (value: number) => void;
}

const { Text, Title } = Typography;

const SliderWithInfo: React.FC<Props> = ({
  label,
  min,
  max,
  defaultValue,
  step,
  description,
  onChange,
}) => {
  return (
    <div style={{ marginBottom: 10 }}>
      <Title level={4}>{label}</Title>
      <Text type="secondary" style={{ fontSize: '90%' }}>
        {description}
      </Text>
      <Slider
        min={min}
        max={max}
        defaultValue={defaultValue}
        step={step}
        onAfterChange={onChange}
      />
    </div>
  );
};

export default SliderWithInfo;
