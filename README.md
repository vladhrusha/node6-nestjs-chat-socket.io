### setup

npm install

npm run start:dev

### usage

access at localhost:3000?username={yourusername}

- events:
  - users
  - message
  - messageDeleted
  - messageUpdated

* messages:
  - message
  - {
    "content": "message",
    "id": "12345"
    }
  - updateMessage
    - {
      "content": "message2",
      "id": "12345"
      }
  - deleteMesage
    - {
      "id": "12345"
      }
  -
