import { firestore } from "firebase-functions";
import { initializeApp, firestore as _firestore, messaging } from "firebase-admin";

initializeApp();

export const AssignInfoToPost = firestore
    .document("Posts/{postId}")
    .onCreate(async (snapshot, context) => {
      const postId = context.params.postId;
      const postSnapshot = await _firestore().doc(`Posts/${postId}`).get(
      const userId = postSnapshot.get("postedBy");
      const userSnapshot = _firestore().doc(`Users/${userId}`).get();
      const userSchool = (await userSnapshot).get("school");
      const userpfp = (await userSnapshot).get("pfpUrl");

      await _firestore().doc(`Posts/${postId}`).update({
        school: userSchool,
        pfpUrl: userpfp,
      });
    });

export const onFollowerCreate = firestore
    .document("Users/{userId}/Followers/{followerId}")
    .onCreate(async (snapshot, context) => {
      const userId = context.params.userId;
      const followerId = context.params.followerId;
      const userName = await _firestore().doc(`Users/${followerId}`).get();
      const username = userName.get("username");
      const createdData = snapshot.data();

      const notificationData = {
        notiType: "NewFollower",
        senderId: followerId,
        senderName: username,
        timestamp: _firestore.FieldValue.serverTimestamp(),
      };

      await _firestore().collection(`Users/${userId}/notifications`)
          .add(notificationData);
      const userSnapshot = await _firestore().doc(`Users/${userId}`)
          .get();
      const fcmToken = userSnapshot.get("FcmToken");
      // Check if the user has an FCM token, then send a push notification
      if (fcmToken) {
        const message = {
          notification: {
            title: "New Follower",
            body: `${username} is now following you.`,
          },
          token: fcmToken,
        };
        // Send a message to the device corresponding to the provided token
        messaging().send(message)
            .then((response) => {
              // Response is a message ID string
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
      }
      // Perform actions based on the created data
      console.log(
          `Followers document created for user ${userId},
      new follower ${followerId}. Created data:`,
          createdData,
      );

      // You can add more logic here based on the created data

      // Instead of returning null, log a message
      console.log("Custom log message: Function execution complete.");
      // Log messages are automatically captured by Firebase Cloud Functions

      return null; // Cloud Functions should return a promise or a value
    });

export const onFavoriteCreate = firestore
// add in notifications n deeplinks to that persons profile. Add in requests as well for private accounts.
    .document("Users/{userId}/Favorites/{favoriteId}")
    .onCreate(async (snapshot, context) => {
      const userId = context.params.userId;
      const favoriteId = context.params.favoriteId;
      const userName = await _firestore().doc(`Users/${favoriteId}`).get();
      const username = userName.get("username");
      const createdData = snapshot.data();

      const notificationData = {
        notiType: "NewFavorite",
        senderId: favoriteId,
        senderName: username,
        timestamp: _firestore.FieldValue.serverTimestamp(),
      };

      const notiId =
        await _firestore().collection(`Users/${userId}/notifications`)
            .add(notificationData);

      // Perform actions based on the created data
      console.log(
          `Favorite document created for user ${userId},
      new favorite ${favoriteId}. Created data: ${notiId}`,
          createdData,
      );

      // You can add more logic here based on the created data

      // Instead of returning null, log a message
      console.log("Custom log message: Function execution complete.");
      // Log messages are automatically captured by Firebase Cloud Functions

      return null; // Cloud Functions should return a promise or a value
    });


export const postLiked = firestore
    .document("Posts/{postId}/likes/{likeId}")
    .onCreate(async (snapshot, context) => {
      const postId = context.params.postId;
      const likeId = context.params.likeId;
      const postSnapshot = await _firestore().doc(`Posts/${postId}`).get();
      const UserId = postSnapshot.get("postedBy");
      const likerId = await _firestore().doc(`Users/${likeId}`).get();
      const likerName = likerId.get("username");
      const createdData = snapshot.data();

      const notificationData = {
        notiType: "NewLike",
        senderId: likeId,
        senderName: likerName,
        post: postId,
        timestamp: _firestore.FieldValue.serverTimestamp(),
      };

      await _firestore().collection(`Users/${UserId}/notifications`)
          .add(notificationData);
      const userSnapshot = await _firestore().doc(`Users/${UserId}`)
          .get();
      const fcmToken = userSnapshot.get("FcmToken");
      // Check if the user has an FCM token, then send a push notification
      if (fcmToken) {
        const message = {
          notification: {
            title: "New like",
            body: `${likerName} liked your post. `,
          },
          token: fcmToken,
        };
        // Send a message to the device corresponding to the provided token
        messaging().send(message)
            .then((response) => {
              // Response is a message ID string
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
      }
      // Perform actions based on the created data
      console.log(
          `post id: ${postId},
      liked by ${likeId}. Created data:`,
          createdData,
      );

      // You can add more logic here based on the created data

      // Instead of returning null, log a message
      console.log("Custom log message: Function execution complete.");
      // Log messages are automatically captured by Firebase Cloud Functions

      return null; // Cloud Functions should return a promise or a value
    });

export const postReposted = firestore
    .document("Posts/{postId}/reposts/{repostId}")
    .onCreate(async (snapshot, context) => {
      const postId = context.params.postId;
      const repostId = context.params.repostId;

      const postSnapshot = await _firestore().doc(`Posts/${postId}`).get();
      const UserId = postSnapshot.get("postedBy");
      const reposterId = await _firestore().doc(`Users/${repostId}`).get();
      const reposterName = reposterId.get("username");

      const createdData = snapshot.data();

      const notificationData = {
        notiType: "NewRepost",
        senderId: repostId,
        senderName: reposterName,
        post: postId,
        timestamp: _firestore.FieldValue.serverTimestamp(),
      };

      await _firestore().collection(`Users/${UserId}/notifications`)
          .add(notificationData);
      const userSnapshot = await _firestore().doc(`Users/${UserId}`)
          .get();
      const fcmToken = userSnapshot.get("FcmToken");
      // Check if the user has an FCM token, then send a push notification
      if (fcmToken) {
        const message = {
          notification: {
            title: "New repost",
            body: `${reposterName} reposted your post.`,
          },
          token: fcmToken,
        };
        // Send a message to the device corresponding to the provided token
        messaging().send(message)
            .then((response) => {
              // Response is a message ID string
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
      }
      // Perform actions based on the created data
      console.log(
          `repost id: ${postId},
      liked by ${repostId}. Created data:`,
          createdData,
      );

      // You can add more logic here based on the created data

      // Instead of returning null, log a message
      console.log("Custom log message: Function execution complete.");
      // Log messages are automatically captured by Firebase Cloud Functions

      return null; // Cloud Functions should return a promise or a value
    });

export const commentAdded = firestore
    .document("Posts/{postId}/comments/{commentId}")
    .onCreate(async (snapshot, context) => {
      const {postId, commentId} = context.params;

      // Retrieve the comment data
      const commentData = snapshot.data();
      const commenterUid = commentData.commenterUid;
      const commentContent = commentData.text;
      // Fetch the commenter's username from the Users collection
      const userSnapshot = await _firestore()
          .doc(`Users/${commenterUid}`).get();
      const username = userSnapshot.get("username");

      // Update the comment data with the username
      await _firestore().doc(`Posts/${postId}/comments/${commentId}`)
          .update({
            commenterUsername: username,
          });

      // Create a notification payload
      const notificationData = {
        notiType: "NewComment",
        senderId: commenterUid,
        senderName: username,
        post: postId,
        timestamp: _firestore.FieldValue.serverTimestamp(),
      };

      // Assuming the post's owner UID is stored in the post data
      const postSnapshot = await _firestore().doc(`Posts/${postId}`).get();
      const postOwnerId = postSnapshot.get("postedBy");

      // Send the notification to the post's owner
      await _firestore().collection(`Users/${postOwnerId}/notifications`)
          .add(notificationData);
      const UserSnapshot = await _firestore().doc(`Users/${postOwnerId}`)
          .get();
      const fcmToken = UserSnapshot.get("FcmToken");
      // Check if the user has an FCM token, then send a push notification
      if (fcmToken) {
        const message = {
          notification: {
            title: "New comment",
            body: `${username} commented ${commentContent}.`,
          },
          token: fcmToken,
        };
        // Send a message to the device corresponding to the provided token
        messaging().send(message)
            .then((response) => {
              // Response is a message ID string
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
      }
      console.log(`Comment added to post: ${postId}, by user: ${commenterUid}`);
      return null;
    });

export const recievedMessage = firestore
    .document("Chats/{chatId}/messages/{messageId}")
    .onCreate(async (snapshot, context) => {
      const {chatId} = context.params;

      // Retrieve the comment data
      const messageData = snapshot.data();
      const senderUid = messageData.senderId;
      const messageContent = messageData.content;
      // Fetch the commenter's username from the Users collection
      const userSnapshot = await _firestore()
          .doc(`Users/${senderUid}`).get();
      const username = userSnapshot.get("username");
      // Assuming the post's owner UID is stored in the post data
      const chatSnap = await _firestore().doc(`Chats/${chatId}`).get();
      const participants = chatSnap.get("participants");
      const otherParticipant = participants.filter((uid) => uid !== senderUid);

      // Send the notification to the post's owner
      const UserSnap = await _firestore().doc(`Users/${otherParticipant}`)
          .get();
      const fcmToken = UserSnap.get("FcmToken");
      // Check if the user has an FCM token, then send a push notification
      if (fcmToken) {
        const message = {
          notification: {
            title: "New message",
            body: `${username} messaged you ${messageContent}.`,
          },
          token: fcmToken,
        };
        // Send a message to the device corresponding to the provided token
        messaging().send(message)
            .then((response) => {
              // Response is a message ID string
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
      }
    });

export const recievedGroupMessage = firestore
    .document("Channels/{chatId}/messages/{messageId}")
    .onCreate(async (snapshot, context) => {
      const {chatId} = context.params;

      // Retrieve the comment data
      const messageData = snapshot.data();
      const senderUid = messageData.senderId;
      const messageContent = messageData.content;
      // Fetch the commenter's username from the Users collection
      const userSnapshot = await _firestore()
          .doc(`Users/${senderUid}`).get();
      const username = userSnapshot.get("username");
      // Assuming the post's owner UID is stored in the post data
      const chatSnap = await _firestore().doc(`Channels/${chatId}`).get();
      const participants = chatSnap.get("participants");
      const otherParticipant = participants.filter((uid) => uid !== senderUid);

      // Send the notification to the post's owner
      const UserSnap = await _firestore().doc(`Users/${otherParticipant}`)
          .get();
      const fcmToken = UserSnap.get("FcmToken");
      // Check if the user has an FCM token, then send a push notification
      if (fcmToken) {
        const message = {
          notification: {
            title: "New message",
            body: `${username} messaged you ${messageContent}.`,
          },
          token: fcmToken,
        };
        // Send a message to the device corresponding to the provided token
        messaging().send(message)
            .then((response) => {
              // Response is a message ID string
              console.log("Successfully sent message:", response);
            })
            .catch((error) => {
              console.log("Error sending message:", error);
            });
      }
    });
// export const channelCreated = firestore
//     .document("Channels/{channelId}")
//     .onCreate(async (snapshot, context) => {
//       const channelId = context.params.channelId;
//       const channelData = snapshot.data();
//       const senders = channelData.participants
//       await _firestore().doc(`Channels/${channelId}`)
//       if channelData.security = allCanSend{
//           .update({
//             senders: senders,
//           }) ;
//         }
//     })
