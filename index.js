// import { tweetsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import axios from "axios";
let tweetsData = [];
async function getTweets() {
  const data = await axios.get("https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets.json");

  console.log(data);

  if (data.data === null) {
    console.log("iunside if");
    return `<h1> No tweets found </h1>`;
  }
  const res = Object.entries(data.data).map(data => {
    return { firebaseId: data[0], ...data[1] };
  });

  tweetsData = res.reverse();
  console.log(tweetsData);
  //   console.log(res);
  //   data.data.forEach(d => console.log(d));
  //   console.log(data.data.);
  return tweetsData;
}

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
  //   console.log("Tweeting id", tweetId.toString());
  //   console.log(tweetsData);
  const targetTweetObj = tweetsData.filter(function (tweet) {
    // console.log("tweeint inside is", tweet);
    return tweet.uuid === tweetId;
  })[0];
  console.log("target object", targetTweetObj);

  let likes = targetTweetObj.likes;
  if (targetTweetObj.isLiked) {
    // likes--;

    await axios.put(
      `https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets/${targetTweetObj.firebaseId}.json`,
      {
        ...targetTweetObj,
        isLiked: !targetTweetObj.isLiked,
        likes: --likes,
      }
    );
  } else {
    // targetTweetObj.likes++;
    await axios.put(
      `https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets/${targetTweetObj.firebaseId}.json`,
      {
        ...targetTweetObj,
        isLiked: !targetTweetObj.isLiked,
        likes: ++likes,
      }
    );
  }
  targetTweetObj.isLiked = !targetTweetObj.isLiked;
  render();
}

async function handleRetweetClick(tweetId) {
  const targetTweetObj = tweetsData.filter(function (tweet) {
    return tweet.uuid === tweetId;
  })[0];

  let retweets = targetTweetObj.retweets;

  console.log("retweets", retweets);
  if (targetTweetObj.isRetweeted) {
    // likes--;

    await axios.put(
      `https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets/${targetTweetObj.firebaseId}.json`,
      {
        ...targetTweetObj,
        isRetweeted: !targetTweetObj.isRetweeted,
        retweets: --retweets,
      }
    );
  } else {
    // targetTweetObj.likes++;
    await axios.put(
      `https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets/${targetTweetObj.firebaseId}.json`,
      {
        ...targetTweetObj,
        isRetweeted: !targetTweetObj.isRetweeted,
        retweets: ++retweets,
      }
    );
  }
  //     targetTweetObj.retweets--;
  //   } else {
  //     targetTweetObj.retweets++;
  //   }
  //   targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted;
  render();
}

function handleReplyClick(replyId) {
  document.getElementById(`replies-${replyId}`).classList.toggle("hidden");
}

async function handleTweetBtnClick() {
  const tweetInput = document.getElementById("tweet-input");

  if (tweetInput.value) {
    await axios.post(`https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets.json`, {
      handle: `@Scrimba`,
      profilePic: `images/scrimbalogo.png`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
    });

    tweetsData.unshift({
      handle: `@Scrimba`,
      profilePic: `images/scrimbalogo.png`,
      likes: 0,
      retweets: 0,
      tweetText: tweetInput.value,
      replies: [],
      isLiked: false,
      isRetweeted: false,
      uuid: uuidv4(),
    });
    render();
    tweetInput.value = "";
  }
}

function handleDeleteTweet(tweet) {
  console.log(tweet);

  axios.delete(`https://twitter-clone-23b7a-default-rtdb.firebaseio.com/tweets/${tweet}.json`);
  tweetsData = tweetsData.filter(tweet => {
    return tweet.firebaseId !== tweet.toString();
  });
  render();
}

async function getFeedHtml() {
  let feedHtml = ``;
  const tweetsData = await getTweets();

  //   const tweetsData = await getTweets();
  //   console.log(typeof tweetsData);
  if (typeof tweetsData === "string") {
    return tweetsData;
  }

  tweetsData.forEach(function (tweet) {
    let likeIconClass = "";

    console.log("tweet insinde get html feed", tweet);
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
  const res = await getFeedHtml();
  document.getElementById("feed").innerHTML = res;
}

render();
