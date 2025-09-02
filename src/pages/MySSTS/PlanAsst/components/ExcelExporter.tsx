import { Button } from 'antd';
import React from 'react';
// 移除静态导入
// import * as XLSX from 'xlsx';

interface ScheduleDetail {
  date: string;
  hours: number;
  content: string;
  // 添加原始节次字段
  periodStart?: number;
  periodEnd?: number;
  weekType?: string;
}

interface ExcelExporterProps {
  courseName: string;
  className: string;
  scheduleDetails: ScheduleDetail[];
  onExport?: () => void;
}

// 导出Excel功能提取为独立函数
export const exportToExcel = async (
  courseName: string,
  className: string,
  scheduleDetails: ScheduleDetail[],
  onExport?: () => void,
) => {
  try {
    // 动态导入 xlsx 库
    const XLSX = await import('xlsx');

    // 获取Excel模板文件
    const response = await fetch('/templates/xls/teaching-plan-template.xls');
    const templateArrayBuffer = await response.arrayBuffer();

    // 创建模板的副本
    const templateCopy = new Uint8Array(templateArrayBuffer.slice(0));

    // 使用xlsx库读取模板副本
    const workbook = XLSX.read(templateCopy, {
      type: 'array',
      cellStyles: true,
      cellFormula: true,
    });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 准备数据 - 将scheduleDetails转换为适合Excel的格式
    const excelData = scheduleDetails.map((detail) => {
      // 从content中提取节次信息，去掉"周X "前缀
      const content = detail.content.replace(/周[一二三四五六日]\s/, '');

      // 如果有原始的节次数据，使用数字格式；否则保持原有逻辑
      let periodText = content;
      if (detail.periodStart && detail.periodEnd) {
        // 生成数字格式的节次，如 "5,6" 或 "1-3"
        if (detail.periodStart === detail.periodEnd) {
          periodText = detail.periodStart.toString();
        } else {
          const periods = [];
          for (let i = detail.periodStart; i <= detail.periodEnd; i++) {
            periods.push(i.toString());
          }
          periodText = periods.join(',');
        }

        // 添加周次类型标识
        if (detail.weekType === 'ODD') {
          periodText += '(单周)';
        } else if (detail.weekType === 'EVEN') {
          periodText += '(双周)';
        }
      }

      return {
        A: detail.date, // 授课时间
        B: detail.hours ? detail.hours.toString() : '', // 学时数改为字符串格式
        C: periodText, // 节次（数字格式）
        D: '', // 授课方式 (留空)
        E: '', // 授课地点 (留空)
        F: '', // 授课章节与内容 (留空)
        G: '', // 课外作业 (留空)
      };
    });

    // 从第2行开始写入数据 (第1行是表头)
    excelData.forEach((row, index) => {
      const rowIndex = index + 2; // 从第2行开始

      // 写入每个单元格的数据
      Object.keys(row).forEach((col) => {
        const cellRef = col + rowIndex;
        const value = row[col as keyof typeof row];

        // 只为非空值创建单元格
        if (value !== null && value !== undefined && value !== '') {
          if (!worksheet[cellRef]) {
            worksheet[cellRef] = { t: 's', v: '' };
          }

          if (typeof value === 'number') {
            worksheet[cellRef].v = value;
            worksheet[cellRef].t = 'n';
          } else {
            worksheet[cellRef].v = String(value);
            worksheet[cellRef].t = 's';
          }
        }
      });
    });

    // 重新计算并设置工作表范围
    const lastRow = Math.max(1, excelData.length + 1); // 至少包含表头行
    const lastCol = 'G'; // 最后一列是G列
    worksheet['!ref'] = `A1:${lastCol}${lastRow}`;

    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xls',
      type: 'array',
      cellStyles: true,
    });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.ms-excel' });

    // 创建下载链接 - 使用班级名+课程名作为文件名
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${className}-${courseName}-教学计划.xls`;
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 调用回调函数
    if (onExport) {
      onExport();
    }
  } catch (error) {
    console.error('导出Excel失败:', error);
  }
};

// 组件本身
const ExcelExporter: React.FC<ExcelExporterProps> = (props) => {
  return (
    <Button
      type="primary"
      onClick={() =>
        exportToExcel(props.courseName, props.className, props.scheduleDetails, props.onExport)
      }
    >
      导出教学计划
    </Button>
  );
};

export default ExcelExporter;
