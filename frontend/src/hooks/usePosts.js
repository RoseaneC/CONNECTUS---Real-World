import { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';

export const usePosts = () => {
  const [timeline, setTimeline] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimeline = async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getTimeline(limit, offset);
      setTimeline(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getMyPosts(limit, offset);
      setMyPosts(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.createPost(postData);
      // Atualizar timeline e meus posts
      await Promise.all([fetchTimeline(), fetchMyPosts()]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.likePost(postId);
      // Atualizar timeline
      await fetchTimeline();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const commentPost = async (postId, commentData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.commentPost(postId, commentData);
      // Atualizar timeline
      await fetchTimeline();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sharePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.sharePost(postId);
      // Atualizar timeline
      await fetchTimeline();
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.deletePost(postId);
      // Atualizar timeline e meus posts
      await Promise.all([fetchTimeline(), fetchMyPosts()]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchPosts = async (query, limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.searchPosts(query, limit, offset);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    timeline,
    myPosts,
    loading,
    error,
    fetchTimeline,
    fetchMyPosts,
    createPost,
    likePost,
    commentPost,
    sharePost,
    deletePost,
    searchPosts
  };
};


