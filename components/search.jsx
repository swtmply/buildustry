import React, { useState } from "react";

import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

const Search = ({ data, onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    const filteredData = data.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    onSearch(filteredData.slice(0, 5));
  };
  if (query.length < 1) {
    onSearch(data);
  }
  return (
    <div className="flex items-center">
      <input
        type="text"
        className="w-100 py-2 px-4 rounded-l-md focus:outline-none focus:ring focus:border-blue-300"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyUp={handleSearch}
      />
      <button
        className="bg-emerald-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-md focus:outline-none"
        onClick={handleSearch}
      >
        <MagnifyingGlassIcon className="bg-emerald-500" />
      </button>
    </div>
  );
};

export default Search;
