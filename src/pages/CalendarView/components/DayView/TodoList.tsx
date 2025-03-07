import { Card, Checkbox, List } from 'antd';
import React from 'react';

const mockTodos = [
  { content: '提交教学计划', done: false },
  { content: '完成实验课材料', done: true },
];

const TodoList: React.FC<{ date: string }> = ({ date }) => {
  console.log(date);
  return (
    <Card title="待办事项">
      <List
        dataSource={mockTodos}
        renderItem={(todo) => (
          <List.Item>
            <Checkbox checked={todo.done}>{todo.content}</Checkbox>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default TodoList;
