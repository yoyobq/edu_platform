import { Spin, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

export interface FlattenedWorkloadRecord {
  key: string;
  sstsTeacherId?: string;
  staffName?: string;
  teachingClassName?: string;
  courseName?: string;
  weeklyHours?: number;
  weekCount?: number;
  coefficient?: number;
  workloadHours?: number;
  totalHours?: number;
}

export interface WorkloadTableProps {
  loading: boolean;
  data: FlattenedWorkloadRecord[];
  totalWorkloadHours: string;
  teacherRowsMap: Map<string, { count: number; indices: number[] }>;
}

const WorkloadTable: React.FC<WorkloadTableProps> = ({
  loading,
  data,
  totalWorkloadHours,
  teacherRowsMap,
}) => {
  // 合并单元格渲染函数
  const renderMergedCell = (value: any, record: FlattenedWorkloadRecord, index: number) => {
    const id = record.sstsTeacherId;
    if (!id) return { children: null, props: { rowSpan: 0 } };
    const info = teacherRowsMap.get(id);
    if (!info) return { children: value, props: { rowSpan: 1 } };
    const isFirst = info.indices[0] === index;
    return { children: isFirst ? value : null, props: { rowSpan: isFirst ? info.count : 0 } };
  };

  const formatClassName = (className: string): string[] => {
    if (!className) return [];
    return className.split(',').filter((name) => name.trim());
  };

  const columns: ColumnsType<FlattenedWorkloadRecord> = [
    {
      title: '工号',
      dataIndex: 'sstsTeacherId',
      key: 'sstsTeacherId',
      align: 'center',
      render: renderMergedCell,
    },
    {
      title: '姓名',
      dataIndex: 'staffName',
      key: 'staffName',
      align: 'center',
      render: renderMergedCell,
    },
    {
      title: '任课班级',
      dataIndex: 'teachingClassName',
      key: 'teachingClassName',
      align: 'center',
      render: (value: any) => {
        if (!value) return '—';
        const classNames = formatClassName(value);
        // 使用CSS样式让\n生效
        return classNames.length > 0 ? (
          <div style={{ whiteSpace: 'pre-line' }}>{classNames.join('\n')}</div>
        ) : (
          '—'
        );
      },
    },
    { title: '课程', dataIndex: 'courseName', key: 'courseName', align: 'center' },
    { title: '周课时', dataIndex: 'weeklyHours', key: 'weeklyHours', align: 'center' },
    { title: '周数', dataIndex: 'weekCount', key: 'weekCount', align: 'center' },
    {
      title: '系数',
      dataIndex: 'coefficient',
      key: 'coefficient',
      align: 'center',
      render: (v) => (v !== null ? Number(v).toFixed(1) : '-'),
    },
    {
      title: '课时',
      dataIndex: 'workloadHours',
      key: 'workloadHours',
      align: 'center',
      render: (v) => (v !== null ? v.toFixed(2) : '-'),
    },
    {
      title: '总课时(节)',
      dataIndex: 'totalHours',
      key: 'totalHours',
      align: 'center',
      render: (v, rec, idx) => {
        const cell = renderMergedCell(v, rec, idx);
        if (cell.children !== null && v !== null) cell.children = Number(v).toFixed(2);
        return cell;
      },
    },
  ];

  return (
    <Spin spinning={loading}>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="key"
        bordered
        size="small"
        pagination={false}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={8} align="right">
                <strong>总计：</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="center">
                <strong>{totalWorkloadHours}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Spin>
  );
};

export default WorkloadTable;
