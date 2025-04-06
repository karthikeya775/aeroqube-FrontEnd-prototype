import { useState } from "react";
import { Button } from "@mui/material";

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState("");
  
    const handleSearch = () => {
      onSearch(query);
    };
  
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
        <input
          type="text"
          placeholder="Search news..."
          style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem', flex: 1 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="contained" onClick={handleSearch}>Search</Button>
      </div>
    );
  };

  export default SearchBar