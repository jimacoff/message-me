import React from 'react';
import { Link } from 'react-router-dom';

class ConversationList extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.fetchConversations().then(
      (action)=>{
        const path = this.props.location.pathname;

        if (path!=='/conversations/new') {
          if(this.props.conversations.length===0) {
            this.props.history.push('/conversations/new');
          }
          else {
            if (path==="/conversations" || path==="/conversations/") {
              const id = this.props.conversations[0].id;
              this.props.history.push(`/conversations/${id}`);
            }
          }
        }
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    const path = nextProps.location.pathname;
    if(nextProps.conversations.length===0) {
      nextProps.history.push('/conversations/new');
    }
    else {
      if (path==="/conversations" || path==="/conversations/") {
        const id = nextProps.conversations[0].id;
        nextProps.history.push(`/conversations/${id}`);
      }
    }
  }

  render() {
    const { conversations } = this.props;
    return(
      <ul className = "conversation-list">
        {conversations.map((conversation, idx) => (
          <li key={idx} className="conversation-list-item">
            <Link className="conversation-item-link" to={`/#/conversations/${conversation.id}`}>
              <img className="latest-author-pic" src={conversation.author_pic}/>
              {conversation.title}
              {conversation.author_name}
              {conversation.message_body}
              {conversation.message_created_at}
            </Link>

            </li>
        ))}
      </ul>
    );
  }
}

export default ConversationList;
