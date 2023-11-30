/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState, useRef} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import filter from 'lodash.filter';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App(): JSX.Element {
  const flatListRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fullData, setFullData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const selectedItem = useRef(null);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const contains = ({name, email}, query) => {
    const {first, last} = name;
    if (
      first.includes(query) ||
      last.includes(query) ||
      email.includes(query)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const handleSearchQuery = query => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filterData = filter(fullData, user => {
      return contains(user, formattedQuery);
    });
    setFilteredData(filterData);
  };

  const fetchData = async url => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      setIsLoading(false);
      setFullData(json.results);
      setFilteredData(json.results);
    } catch (error) {
      setError(error);
      setIsLoading(false);
      console.error(error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData('https://randomuser.me/api/?results=20');
  }, []);

  useEffect(() => {
    if (
      selectedItem.current != null &&
      filteredData.length === fullData.length
    ) {
      const selectedItemIndex = fullData.findIndex(
        (item, idx) => item.login.uuid === selectedItem.current.login.uuid,
      );
      selectedItem.current = null;
      flatListRef.current.scrollToIndex({index: selectedItemIndex});
    }
  }, [filteredData, fullData]);

  const handleOnPress = (item, idx) => {
    setSearchQuery('');
    selectedItem.current = item;
    setFilteredData(fullData);
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={'large'} color="#5500dc" />
      </View>
    );
  }

  if (!isLoading && error) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Some Error in getting API response</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <TextInput
        placeHolder="Search"
        clearButtonMode="always"
        style={styles.searchBarStyle}
        autoCapitalize="none"
        autoCorrect={false}
        value={searchQuery}
        onChangeText={query => handleSearchQuery(query)}
      />
      <FlatList
        initialNumToRender={20}
        ref={flatListRef}
        data={filteredData}
        keyExtractor={item => item.login.uuid}
        renderItem={({item, index}) => {
          return (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => {
                handleOnPress(item, index);
              }}>
              <Image
                style={{height: 50, width: 50, borderRadius: 25}}
                source={{uri: item.picture.thumbnail}}
              />
              <View>
                <Text style={styles.textName}>
                  {item.name.first} {item.name.last}{' '}
                </Text>
                <Text style={styles.textEmail}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBarStyle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 5,
  },
  textFriends: {
    fontSize: 20,
    textAlign: 'left',
    marginLeft: 10,
    fontWeight: 'bold',
    marginTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  textName: {
    fontSize: 17,
    marginLeft: 10,
    fontWeight: '600',
  },
  textEmail: {
    fontSize: 14,
    marginLeft: 10,
    color: 'grey',
  },
  imageStyle: {width: 50, height: 50, borderRadius: 25},
});

export default App;
