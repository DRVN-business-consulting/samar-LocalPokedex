import React, { useState, useEffect, useContext } from "react";
import { View, Text, FlatList, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoritesContext } from "./FavoriteContext"; // Update the path to your context

const fetchPokemonsFromStorage = async () => {
  try {
    const savedData = await AsyncStorage.getItem("pokemonData");
    if (savedData !== null) {
      return JSON.parse(savedData);
    } else {
      console.log("No Pokémon data found in storage.");
      return [];
    }
  } catch (error) {
    console.error("Error loading saved Pokémon data:", error);
    return [];
  }
};

const Favorites = () => {
  const { favorites } = useContext(FavoritesContext); // Get favorites from context
  const [favoritePokemons, setFavoritePokemons] = useState([]);

  useEffect(() => {
    const loadFavorites = async () => {
      const allPokemons = await fetchPokemonsFromStorage();
      const filteredPokemons = allPokemons
        .filter(pokemon => favorites.includes(pokemon.id))
        .reduce((unique, pokemon) => {
          if (!unique.some(p => p.id === pokemon.id)) {
            unique.push(pokemon);
          }
          return unique;
        }, []);
      setFavoritePokemons(filteredPokemons);
    };

    loadFavorites();
  }, [favorites]);

  const renderFavorite = ({ item }) => {
    const pokemonName = item?.name?.english || item?.name || "Unknown Name"; // Safe check for name

    return (
      <View style={styles.pokemonItem}>
        <Image
          source={{
            uri:
              typeof item.image === "string"
                ? item.image
                : "https://via.placeholder.com/100",
          }}
          style={styles.pokemonImage}
        />
        <Text style={styles.pokemonText}>{`ID: ${item?.id || "Unknown ID"}`}</Text>
        <Text style={styles.pokemonText}>{`Name: ${pokemonName}`}</Text>
        <Text style={styles.pokemonText}>
          {`Types: ${
            Array.isArray(item?.type) ? item.type.join(", ") : "N/A"
          }`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {favoritePokemons.length > 0 ? (
        <FlatList
          data={favoritePokemons}
          keyExtractor={(item) =>
            item?.id ? item.id.toString() : Math.random().toString()
          }
          renderItem={renderFavorite}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noFavoritesText}>No favorite Pokémon yet!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  listContainer: {
    marginTop: 20,
  },
  pokemonItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  pokemonImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  pokemonText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  noFavoritesText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
});

export default Favorites;
