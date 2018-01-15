# Message-Me!
http://message-me-rainmire.herokuapp.com/

Message-Me is a messaging client based on the popular Messenger application by Facebook. It consists of 6 key components.

* Live Chat
* User Authentication
* Direct Conversations
* Group Conversations
* User Search
* Image Uploading

## Creating Conversations

![live chat](docs/create_conversation/create_conversation.gif)


## Live Chat

Users can experience live communication with others through Rails 5 Action Cable.

**Instant Message Delivery**

Upon hitting return, a message is send to the database through an AJAX request, where it is saved and passed along to Action Cable and broadcasted to the appropriate conversation. Users connected to the same conversation will have their page automatically updated.

The MessageRelayJob directs the saved message to the correct channel.

```
class MessageRelayJob < ApplicationJob
  def perform(message, conversation)
    message = Api::MessagesController.render(
      partial: 'api/messages/message',
      locals: { message: message }
    )
    ActionCable.server.broadcast("channel_#{conversation.id}",
                                 message: JSON.parse(message))
  end
end
```

Users are always listening to their currently selected Conversation channel. When a new message is sent, the message is received and dispatched to the store.

```
# ...
export const setSocket = channelName => dispatch => {
  if (window.App.channel) {
    removeSocket();
  }
  addSocket(channelName, dispatch);
};

const removeSocket = () => (
  window.App.cable.subscriptions.remove(window.App.channel)
);

const addSocket = (channelName, dispatch) => {
  window.App.channel = window.App.cable.subscriptions.create({
    channel: 'ChannelChannel',
    channel_name: channelName
  }, {
    connected: () => {},
    disconnected: () => {},
    received: (data) => {
      dispatch(receiveMessage(data.message));
    }
  });
};
```

## User Authentication

Users can sign in, sign out, register, and create a guest account

**Encryption**

Message-Me requires users register with an unique email, and encrypts the password using `Bcrypt` before saving it to the database.

```
class User < ApplicationRecord
  # ...
  def password=(password)
    @password = password
    self.password_digest = BCrypt::Password.create(password)
  end

  def is_password?(password)
    BCrypt::Password.new(self.password_digest).is_password?(password)
  end
  # ...
end
```

**Secure Persistent State**

Users remain signed in until logout by generating and delivering a unique session token to the user as a cookie on every login. The token is saved to the database and compared with the user's token to maintain their login status.

```
class User < ApplicationRecord
  # ...
    def generate_unique_session_token
      self.session_token = new_session_token
      while User.find_by(session_token: self.session_token)
        self.session_token = new_session_token
      end
      self.session_token
    end

    def new_session_token
      SecureRandom.urlsafe_base64
    end
  # ...
```

## Direct Conversations

Users can exchange personal messages to another user.

**Creating a personal conversation**

Users can start a direct conversation with another user using the Create Conversation button. This opens a new conversation form, which when submitted redirects to the newly created conversation.

The conversation controller creates ConversationMembership models for both the current user and the user they're starting a conversation with.

```
class Api::ConversationsController < ApplicationController
  def create
    title = current_user.display_name
    author_id = current_user.id
    targetUserId = params[:targetUser][:targetUserId]

    @conversation = Conversation.new( title: title, author_id: author_id )

    if @conversation.save
      conversation_membership = ConversationMembership.new(
        member_id: author_id, conversation_id: @conversation.id )
      target_conversation_membership = ConversationMembership.new(
        member_id: targetUserId, conversation_id: @conversation.id )
      if conversation_membership.save && target_conversation_membership.save
        render 'api/conversations/show'
      else
        render json: conversation_membership.errors.full_messages, status: 422
      end
    else
      render json: @conversation.errors.full_messages, status: 422
    end
  end
  # ...
end
```

Upon successful conversation creation, the user is immediately taken to the page of the new conversation. If the conversation failed to create, the new conversation page will refresh instead.

```
class NewConversation extends React.Component {
  # ...
  handleSubmit(e) {
    e.preventDefault();
    const targetUser = this.state;
    this.props.createConversation(targetUser).then(
      (id)=>(
        this.props.history.push(`/conversations/${id}`)
      ),
      (action)=>(
        this.props.history.push('/conversations/new')
      )
    );
  }
  # ...
}
```

## Group Conversations

Users can hold a conversation with multiple other users.

**Adding Members to a Conversation**

Users can add new members to a direct conversation to create a group conversation. The new users are automatically added to the members list and will now be able to see this new conversation in their navigation bar and access it. Multiple members can be added at one time.

The update method searches for the requested conversation within the current user's available conversations. It then creates a ConversationMembership for each user being added to the conversation, but only if they are not already a member.

```
class Api::ConversationsController < ApplicationController
  def update
    @conversation = current_user.conversations.find(params[:id])
    if @conversation
      @users = []
      params[:users].keys.each do |id|
        if !ConversationMembership.exists?(['member_id = ? and conversation_id = ?', id, @conversation.id])
          membership = ConversationMembership.new(member_id: id, conversation_id: @conversation.id)
          membership.save
          @users << User.find(id)
        end
      end
      render "api/users/index"
    else
      render json: "Conversation does not exist", status: 400
    end
  end
end
```

## User Search

Users can search for other users when using the add members function. A list of up to 5 users will be displayed with names matching the search input. The matches are updated for each keystroke. Clicking returned results adds them to a list of users to be added. Hitting return in the search field sends a request to add all selected users to the current conversation.
