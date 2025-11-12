import axios from 'axios';
import React, { useRef, useState } from 'react';

export const Test = ({ getContent }: any) => {
  const [keyword, setKeyword] = useState('');
  // const keyword = useRef<any>();
  const handelSearch = async () => {
    const res = await axios.get(`https://api.github.com/search/users?q=${keyword}`).then((res) => {
      console.log(res.data.items);
      getContent(res.data.items.map((item: { login: any }) => item.login));
    });
  };
  const handelChange = (e: any) => {
    setKeyword(e.target.value);
  };
  return (
    <>
      <input type="text" value={keyword} onChange={handelChange} />
      <button onClick={handelSearch}>search</button>
    </>
  );
};
