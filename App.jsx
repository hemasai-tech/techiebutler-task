import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';

/* The `PostDetailComponent` function component is responsible for displaying the details of a specific
post based on the `postId` provided as a prop. */
const PostDetailComponent = ({ postId, onClearSelectedPost }) => {
  const [postDetails, setPostDetails] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${postId}`);
        setPostDetails(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPostDetails();
  }, [postId]);

  return (
    <View style={styles.postDetailContainer}>
      {postDetails ? (
        <View>
          <Text style={{ color: '#000' }}>ID: {postDetails.id}</Text>
          <Text style={{ color: '#000' }}>Title: {postDetails.title}</Text>
          <Text style={{ color: '#000' }}>Body: {postDetails.body}</Text>
        </View>
      ) : (
        <ActivityIndicator size={'small'} style={{ alignContent: 'center', justifyContent: 'center' }} />
      )}
      <TouchableOpacity style={styles.clearButton} onPress={onClearSelectedPost}>
        <Text style={styles.clrBtn}>Clear Selection</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * The `computeDetails` function performs heavy computation on data and logs the time taken to complete
 * the computation.
 * @returns The function `computeDetails` is returning a copy of the `data` object after performing
 * heavy computation on it.
 */
const computeDetails = (data) => {
  const start = performance.now();
  // Perform heavy computation on data
  const result = { ...data };
  const end = performance.now();
  console.log('Heavy Computation Time:', end - start, 'ms');
  return result;
};

const App = () => {
  const [postsData, setPostsData] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15)
  const [offset, setOffset] = useState(0); // Initialize offset
  const [loading, setLoading] = useState(false);

  const getPosts = async () => {
    try {
      const postsArr = await axios.get(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`);
      setPostsData(prevPosts => [...prevPosts, ...postsArr.data]); // Concatenate new posts with existing array
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getPosts();
  }, []);

/* The `loadMorePosts` function defined using `useCallback` is responsible for loading more posts when
the user reaches the end of the current list of posts. */
  const loadMorePosts = useCallback(() => {
    setLoading(true);
    const newOffset = (page - 1) * limit + offset; // Calculate new offset
    setPage(prevPage => prevPage + 1);
    setLimit(newOffset);
    getPosts();
    setLoading(false);
  }, [limit, page, offset]);

/* The `renderPostData` constant is using the `useCallback` hook to create a memoized callback
function. This function is responsible for rendering the individual post data within the `FlatList`
component. */
  const renderPostData = useCallback(({ item }) => (
    <TouchableOpacity style={styles.postView} onPress={() => setSelectedPostId(item.id)}>
      <Text style={styles.title}>{item.id}</Text>
      <Text style={[styles.title, { fontWeight: '800' }]}>{item.title}</Text>
    </TouchableOpacity>
  ), []);

  const clearSelectedPost = useCallback(() => {
    setSelectedPostId(null);
  }, []);

/* The `useMemo` hook in the provided code snippet is used to memoize the result of a computation based
on the dependencies provided in the dependency array. */
  const memoizedDetails = useMemo(() => {
    if (selectedPostId) {
      const postData = postsData.find(post => post.id === selectedPostId);
      return computeDetails(postData);
    }
    return null;
  }, [postsData, selectedPostId]);

  const memoizedClearSelectedPost = useCallback(() => {
    clearSelectedPost();
  }, [clearSelectedPost]);

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.postHeader}>Posts Data</Text>
      {postsData ? (
        <FlatList
          data={postsData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderPostData}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (
            <>
              {
                loading ? (
                  <ActivityIndicator size={'small'} style={{ alignContent: 'center', justifyContent: 'center' }} />
                ) : null
              }
            </>
          )}
        />
      ) : (
        <ActivityIndicator size={'small'} style={{ alignContent: 'center', justifyContent: 'center' }} />
      )}
      {selectedPostId && <PostDetailComponent postId={selectedPostId} onClearSelectedPost={memoizedClearSelectedPost} />}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  postView: {
    flexDirection: 'row',
    backgroundColor: '#92C7CF',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  title: {
    color: '#000',
    fontSize: 18,
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  postHeader: {
    fontWeight: '900',
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    paddingVertical: 10,
  },
  postDetailContainer: {
    marginHorizontal: 10,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  clrBtn: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700'
  }
});
