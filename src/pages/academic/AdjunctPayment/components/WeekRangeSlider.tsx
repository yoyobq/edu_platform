import React from 'react';
import { Col, Row, Slider, Typography } from 'antd';
import dayjs from 'dayjs';
import type { Semester } from '@/services/plan/types';

interface WeekRangeSliderProps {
  semester: Semester | null;
  totalWeeks: number;
  tempWeekRange: [number, number];
  onWeekRangeChange: (value: number[]) => void;
  onWeekRangeAfterChange: (value: number[]) => void;
}

const WeekRangeSlider: React.FC<WeekRangeSliderProps> = React.memo(
  ({ semester, totalWeeks, tempWeekRange, onWeekRangeChange, onWeekRangeAfterChange }) => {
    // 生成滑动条的标记，包含周数和日期
    const generateSliderMarks = () => {
      if (!semester?.firstTeachingDate) return { 1: '1周', [totalWeeks]: `${totalWeeks}周` };

      const marks: Record<number, React.ReactNode> = {};
      const startDate = dayjs(semester.firstTeachingDate);

      // 添加第一周和最后一周的标记
      marks[1] = (
        <div className="slider-mark">
          <div>1周</div>
          <div className="date-hint">{startDate.format('MM/DD')}</div>
        </div>
      );

      marks[totalWeeks] = (
        <div className="slider-mark">
          <div>{totalWeeks}周</div>
          <div className="date-hint">{startDate.add(totalWeeks - 1, 'week').format('MM/DD')}</div>
        </div>
      );

      // 添加中间的标记（每4周一个标记）
      for (let i = 4; i < totalWeeks; i += 4) {
        marks[i] = (
          <div className="slider-mark">
            <div>{i}周</div>
            <div className="date-hint">{startDate.add(i - 1, 'week').format('MM/DD')}</div>
          </div>
        );
      }

      return marks;
    };

    return (
      <Row>
        <Col span={24}>
          <Typography.Text strong>教学周范围：</Typography.Text>
          <span className="week-range-text">
            第 {tempWeekRange[0]} 周 - 第 {tempWeekRange[1]} 周
          </span>
        </Col>
        <Col span={24} className="slider-container">
          <Slider
            range
            min={1}
            max={totalWeeks}
            value={tempWeekRange}
            onChange={onWeekRangeChange}
            onChangeComplete={onWeekRangeAfterChange}
            marks={generateSliderMarks()}
            tooltip={{
              formatter: (value) => {
                if (!semester?.firstTeachingDate) return `第${value}周`;
                const startDate = dayjs(semester.firstTeachingDate);
                // 计算当前周的周一日期
                const weekStartDate = startDate.add(value! - 1, 'week');
                // 计算当前周的周日日期 (周一+6天)
                const weekEndDate = weekStartDate.add(6, 'day');
                // 根据滑块位置决定显示周一还是周日的日期
                const isEndHandle = value === tempWeekRange[1];
                const displayDate = isEndHandle ? weekEndDate : weekStartDate;
                return `第${value}周 (${displayDate.format('MM/DD')})`;
              },
              open: true,
              placement: 'top',
            }}
          />
        </Col>
      </Row>
    );
  },
);

export default WeekRangeSlider;
