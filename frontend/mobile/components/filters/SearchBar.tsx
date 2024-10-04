import React, { FC, useState } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { useColorScheme } from '@/components/useColorScheme';
import { useFilter } from '@/context/FilterContext';
import SearchIcon from '@/assets/images/search.png';
import SearchIcon2 from '@/assets/images/searchW.png';
import { Colors } from '@/constants/colors';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: FC<SearchBarProps> = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const colorScheme = useColorScheme();
  const { setSearchQuery } = useFilter();

  const handleSearch = (query: string) => {
    if (onSearch) {
      setSearchInput(query);
      onSearch(query)
    } else {
      setSearchInput(query);
      setSearchQuery(query);
    };
  };

  return (
    <View>
      <View
        style={[
          styles.searchBarContainer,
          isFocused && styles.searchBarContainerFocused,
        ]}
      >
        <TextInput
          placeholder="Search..."
          value={searchInput}
          onChangeText={handleSearch}
          style={styles.searchInput}
          placeholderTextColor={colorScheme === 'dark' ? '#fff' : '#757575'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Image
          alt="image"
          source={colorScheme === 'dark' ? SearchIcon2 : SearchIcon}
          style={styles.searchIcon}
          contentFit='contain'
        />
      </View>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchBarContainer: {
    width: 250,
    height: 40,
    backgroundColor: '#EBF1F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
  },
  searchBarContainerFocused: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  searchIcon: {
    width: 15,
    height: 15,
  },
});
