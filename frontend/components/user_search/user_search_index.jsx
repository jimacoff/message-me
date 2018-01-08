import React from 'react';
import UserSearchIndexItem from './user_search_index_item';

export default ({searchItems, firstTime, searchVal, clearState, receiveUserSelection}) => {
  if (searchVal === "") return (<ul className="UserSearchIndex"></ul>);

  let listItems;

  if (searchItems.length !== 0) {
    listItems =
      searchItems.map(
        (user) => (
          <li key={user.id}>
            <button className="user-search-button" onClick={
              ()=>{
                receiveUserSelection(user);
                clearState();
              }
            }>
              {user.display_name}
            </button>
          </li>
        )
      );
  } else if (firstTime === false){
    listItems =
      <li>No results found</li>;
  }


  return(
    <ul className="user-search-list">
      {listItems}
    </ul>
  );
};
