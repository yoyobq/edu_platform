import { Button } from 'antd';
import React from 'react';
// 移除静态导入
// import * as XLSX from 'xlsx';

interface ScheduleDetail {
  date: string;
  hours: number;
  content: string;
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

      return {
        A: detail.date, // 授课时间
        B: detail.hours || NaN, // 使用传入的学时数
        C: content, // 节次
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
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 's', v: '' };
        }

        // 确保值是字符串或数字类型
        const value = row[col as keyof typeof row];
        if (value === null || value === undefined) {
          worksheet[cellRef].v = '';
          worksheet[cellRef].t = 's';
        } else if (typeof value === 'number') {
          worksheet[cellRef].v = value;
          worksheet[cellRef].t = 'n';
        } else {
          worksheet[cellRef].v = String(value);
          worksheet[cellRef].t = 's';
        }
      });
    });

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
