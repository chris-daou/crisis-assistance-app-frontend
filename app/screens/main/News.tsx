import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { NEWS_API_KEY } from '@env'; // Import your API key from .env file
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AppDrawerParamList } from '../../components/Navigation/AppNavigator';

export default function NewsScreen() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<DrawerNavigationProp<AppDrawerParamList>>();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          `https://content.guardianapis.com/search?q=lebanon&api-key=${NEWS_API_KEY}&order-by=newest&page-size=30`
        );
        const data = await response.json(); // Parse the response as JSON
        
        setNews(data.response.results); // Set the news articles to state
      } catch (error) {
        console.error('Error fetching news:', error); // Log any errors
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerIcons}>Provided By: The Guardian</Text>

      <View style={styles.menuButtonContainer}>
        <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
          <FontAwesome5 name="bars" size={25} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      ) : (
        <FlatList 
          style={{ marginTop: 60 }}
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View>
                <Text style={styles.title}>{item.webTitle}</Text>
                <Text style={styles.description}>{item.webDescription}</Text>
              </View>
              <View style={styles.readMoreContainer}>
                <TouchableOpacity onPress={() => Linking.openURL(item.webUrl)}>
                  <Text style={styles.link}>Read more</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 40,
  },
  card: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  link: {
    fontSize: 14,
    color: 'gray',
    fontWeight: 'bold',
  },
  readMoreContainer: {
    marginTop: -20,
  },
  menuButtonContainer: {
    position: 'absolute',
    top: 46,
    right: 20,
  },
  headerIcons: {
    position: 'absolute',
    top: 45,
    left: 25,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'gray',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    marginTop: 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
