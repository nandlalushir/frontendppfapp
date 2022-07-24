import Axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfileFollowers() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const { username } = useParams();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`);
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There was a problem");
      }
    }

    fetchPosts();
  }, [username]);

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link key={index} to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>
        );
      })}
      {posts.length == 0 && <p className="lead text-muted text-center">You don&rsquo;t have any followers yet.</p>}
    </div>
  );
}

export default ProfileFollowers;
