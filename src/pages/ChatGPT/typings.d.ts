declare namespace ChatGPT {
  type messageObj = {
    role: string;
    content: string;
  };

  type ChatCardProps = {
    messages: {
      role: string;
      content: string;
    }[];
  };

  type ChatInt = {
    model: string; // "gpt-3.5-turbo",
    messages: {
      role: string;
      content: string;
    }[];
    /**
     * [{"role": "system", "content": "You are a helpful assistant."},
     *  {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
     *  {"role": "user", "content": "Where was it played?"}]
     */
    temperature?: numer; // 默认 1，范围0-2 越高答题思路越宽
    top_p?: number; // 默认1，范围 0-2，不要和 temperature 一起修改
    n?: number; //  1 | 最多返回几份答案
    stream?: boolean; // | optional | false | 像官网一样流式传输结果
    stop?: string | string[] | null; // 终止流式传输的字符
    max_tokens?: number; // 512 infinite | 最高 2048，太低没用 | 每次最多使用多少 token
    presence_penalty?: number; //  0 | -2 to 2 | 正值允许创新，负值防止跑题
    frequency_penalty?: number; //  0 | -2 to 2 | 正值防止逐字重复同一行
    logit_bias?: any; // map | optional | null 没看懂
    user?: string; // 用户标识符
  };
}
