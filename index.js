// import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
const appSettings = {
  databaseURL: "https://twitter-clone-23b7a-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const tweetsInDB = ref(database, "tweets");

let tweetsData = [];

onValue(tweetsInDB, function (snapshot) {
  if (snapshot.exists()) {
    let val = Object.entries(snapshot.val()).map(tweet => {
      return {
        firebaseId: tweet[0],
        ...tweet[1],
      };
    });

    val = val.reverse();
    tweetsData = val;
    render();
  }
  noTweets();
});

function noTweets() {}

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    handleLikeClick(e.target.dataset.like);
  } else if (e.target.dataset.retweet) {
    handleRetweetClick(e.target.dataset.retweet);
  } else if (e.target.dataset.reply) {
    handleReplyClick(e.target.dataset.reply);
  } else if (e.target.id === "tweet-btn") {
    handleTweetBtnClick();
  } else if (e.target.dataset.close) {
    handleDeleteTweet(e.target.dataset.close);
  }
});

async function handleLikeClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];
  let location = ref(database, `/tweets/${targetTweetObj.firebaseId}`);

  let likes = targetTweetObj.likes;
  if (targetTweetObj.isLiked) {
    update(location, {
      ...targetTweetObj,
      isLiked: !targetTweetObj.isLiked,
      likes: --likes,
    });
  } else {
    {
      update(location, {
        ...targetTweetObj,
        isLiked: !targetTweetObj.isLiked,
        likes: ++likes,
      });
    }
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  render();
}

async function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  let retweets = targetTweetObj.retweets;
  let location = ref(database, `/tweets/${targetTweetObj.firebaseId}`);

  if (targetTweetObj.isRetweeted) {
    update(location, {
      ...targetTweetObj,
      isRetweeted: !targetTweetObj.isRetweeted,
      retweets: --retweets,
    });
  } else {
    update(location, {
      ...targetTweetObj,
      isRetweeted: !targetTweetObj.isRetweeted,
      retweets: ++retweets,
    });
  }

  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

async function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");

  if (tweetInput.value) {
    push(tweetsInDB, {
      handle: `@Elon ✅`,
      profilePic: `images/musk.png`,
      likes: 6500,
      retweets: 234,
      tweetText: `I need volunteers for a one-way mission to Mars 🪐. No experience necessary🚀`,
      replies: [
        {
          handle: `@TomCruise ✅`,
          profilePic: `images/tcruise.png`,
          tweetText: `Yes! Sign me up! 😎🛩`,
        },
        {
          handle: `@ChuckNorris ✅`,
          profilePic: `images/chucknorris.jpeg`,
          tweetText: `I went last year😴`,
        },
      ],
      isLiked: false,
      isRetweeted: false,
      uuid: "3c23454ee-c0f5-9g9g-9c4b-77835tgs2",
    });
    // await axios.post(`https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets.json`, {
    //   handle: `@Scrimba`,
    //   profilePic: `images/scrimbalogo.png`,
    //   likes: 0,
    //   retweets: 0,
    //   tweetText: tweetInput.value,
    //   replies: [],
    //   isLiked: false,
    //   isRetweeted: false,
    //   uuid: uuidv4(),
    // });

    // tweetsData.unshift({
    //   handle: `@Scrimba`,
    //   profilePic: `images/scrimbalogo.png`,
    //   likes: 0,
    //   retweets: 0,
    //   tweetText: tweetInput.value,
    //   replies: [],
    //   isLiked: false,
    //   isRetweeted: false,
    //   uuid: uuidv4(),
    // });
    render();
    tweetInput.value = "";
  }
}

async function handleDeleteTweet(tweetId) {
  let exactLocationInDB = await ref(database, `/tweets/${tweetId}`);
  remove(exactLocationInDB);

  console.log(tweetId);

  tweetsData = tweetsData.filter(tweet => {
    return tweet.firebaseId !== tweetId.toString();
  });
  render();
}

async function getFeedHtml() {
  let feedHtml = ``;

  console.log(tweetsData.length);
  if (tweetsData.length === 0) {
    return `<h1> No tweets found </h1>`;
  }

  tweetsData.forEach(function (tweet) {
    let likeIconClass = "";

    if (tweet.isLiked) {
      likeIconClass = "liked";
    }

    let retweetIconClass = "";

    if (tweet.isRetweeted) {
      retweetIconClass = "retweeted";
    }

    let repliesHtml = "";

    if (tweet.replies?.length > 0) {
      tweet.replies.forEach(function (reply) {
        repliesHtml += `
<div class="tweet-reply">
    <div class="tweet-inner">
        <img src="${reply.profilePic}" class="profile-pic">
            <div>
                <p class="handle">${reply.handle}</p>
                <p class="tweet-text">${reply.tweetText}</p>
            </div>
        </div>
</div>
`;
      });
    }

    feedHtml += `
<div class="tweet" >
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
           <div class="handle-container"> <p class="handle">${
             tweet.handle
           }</p> <i class="fa-solid fa-xmark" data-close="${tweet.firebaseId}"
           ></i> </div>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies ? tweet.replies.length : 0}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`;
  });
  return feedHtml;
}

async function render() {
  //   const res = await getFeedHtml();
  document.getElementById("feed").innerHTML = await getFeedHtml();
}

render();
