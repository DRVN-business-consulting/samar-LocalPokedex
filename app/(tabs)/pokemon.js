import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Button,
  Alert,
  FlatList,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FavoritesContext } from "./FavoriteContext";
import { useNavigation } from "@react-navigation/native";

const fetchWithTimeout = (url, options, timeout = 8000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
};

const SavePokemons = () => {
  const [savedPokemons, setSavedPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleFavorite, favorites } = useContext(FavoritesContext);
  const [editingPokemon, setEditingPokemon] = useState(null);
  const [newName, setNewName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPokemonName, setNewPokemonName] = useState("");
  const [availableTypes, setAvailableTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const navigation = useNavigation();

  const loadAvailableTypes = async () => {
    try {
      const types = await AsyncStorage.getItem("pokemonTypes");
      if (types !== null) {
        setAvailableTypes(JSON.parse(types));
      } else {
        // Default types if none are found in AsyncStorage
        const defaultTypes = ["Grass", "Fire", "Water", "Electric", "Flying"];
        setAvailableTypes(defaultTypes);
      }
    } catch (error) {
      console.error("Error loading types:", error);
    }
  };

  const fetchAndSavePokemons = async () => {
    try {
      const response = await fetchWithTimeout(
        "https://pokemon-api-nssw.onrender.com/pokemon"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Data:", data);

      await AsyncStorage.setItem("pokemonData", JSON.stringify(data));
      console.log("Data Saved to AsyncStorage:", data);
      Alert.alert("Success", "Pokémon data saved successfully!");

      setSavedPokemons(data);
      setFilteredPokemons(data);
    } catch (error) {
      console.error("Error fetching or saving Pokémon data:", error);
      Alert.alert(
        "Error",
        `Failed to fetch or save Pokémon data: ${error.message}`
      );
    }
  };

  const loadSavedPokemons = async () => {
    try {
      const savedData = await AsyncStorage.getItem("pokemonData");
      console.log("Data Loaded from AsyncStorage:", savedData);

      if (savedData !== null) {
        const parsedData = JSON.parse(savedData);
        console.log("Parsed Data:", parsedData);
        setSavedPokemons(parsedData);
        setFilteredPokemons(parsedData);
      } else {
        console.log("No Pokémon data found in storage.");
      }
    } catch (error) {
      console.error("Error loading saved Pokémon data:", error);
    }
  };

  const deletePokemon = async (id) => {
    try {
      const updatedPokemons = savedPokemons.filter(
        (pokemon) => pokemon.id !== id
      );
      await AsyncStorage.setItem(
        "pokemonData",
        JSON.stringify(updatedPokemons)
      );
      setSavedPokemons(updatedPokemons);
      setFilteredPokemons(updatedPokemons);
      Alert.alert("Success", "Pokémon removed successfully!");
    } catch (error) {
      console.error("Error deleting Pokémon:", error);
      Alert.alert("Error", "Failed to remove Pokémon.");
    }
  };

  const editPokemonName = async () => {
    if (!editingPokemon || !newName.trim()) {
      Alert.alert("Error", "Invalid name");
      return;
    }

    try {
      const updatedPokemons = savedPokemons.map((pokemon) =>
        pokemon.id === editingPokemon.id
          ? { ...pokemon, name: { ...pokemon.name, english: newName } }
          : pokemon
      );
      await AsyncStorage.setItem(
        "pokemonData",
        JSON.stringify(updatedPokemons)
      );
      setSavedPokemons(updatedPokemons);
      setFilteredPokemons(updatedPokemons);
      setModalVisible(false);
      setEditingPokemon(null);
      setNewName("");
      Alert.alert("Success", "Pokémon name updated successfully!");
    } catch (error) {
      console.error("Error updating Pokémon name:", error);
      Alert.alert("Error", "Failed to update Pokémon name.");
    }
  };

  const createPokemon = async () => {
    if (!newPokemonName.trim() || selectedTypes.length === 0) {
      Alert.alert("Error", "Invalid input");
      return;
    }

    try {
      const newId =
        savedPokemons.reduce(
          (maxId, pokemon) => Math.max(maxId, pokemon.id),
          0
        ) + 1;

      const newPokemon = {
        id: newId,
        name: { english: newPokemonName },
        type: selectedTypes,
        image: "https://via.placeholder.com/100",
      };

      const updatedPokemons = [...savedPokemons, newPokemon];
      await AsyncStorage.setItem(
        "pokemonData",
        JSON.stringify(updatedPokemons)
      );
      setSavedPokemons(updatedPokemons);
      setFilteredPokemons(updatedPokemons);
      setCreateModalVisible(false);
      setNewPokemonName("");
      setSelectedTypes([]);
      Alert.alert("Success", "New Pokémon created successfully!");
    } catch (error) {
      console.error("Error creating Pokémon:", error);
      Alert.alert("Error", "Failed to create new Pokémon.");
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const lowercasedQuery = query.toLowerCase();
      const filtered = savedPokemons.filter((pokemon) =>
        pokemon.name?.english?.toLowerCase().includes(lowercasedQuery)
      );
      setFilteredPokemons(filtered);
    } else {
      setFilteredPokemons(savedPokemons);
    }
  };

  useEffect(() => {
    loadSavedPokemons();
    loadAvailableTypes(); // Load types on component mount
  }, []);

  const handlePress = (item) => {
    navigation.navigate("details", { pokemon: item });
  };

  const renderPokemon = ({ item }) => {
    const isFavorite = favorites.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.pokemonItem}
        onPress={() => handlePress(item)}
      >
        <Image
          source={{
            uri:
              typeof item.image === "string"
                ? item.image
                : "https://via.placeholder.com/100",
          }}
          style={styles.pokemonImage}
        />
        <Text style={styles.pokemonText}>{`ID: ${item.id}`}</Text>
        <Text style={styles.pokemonText}>
          {`Name: ${item.name?.english || item.name || "Unknown"}`}
        </Text>
        <Text style={styles.pokemonText}>
          {`Types: ${
            Array.isArray(item.type)
              ? item.type.join(", ")
              : "No types available"
          }`}
        </Text>

        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite ? styles.favorited : styles.notFavorited,
          ]}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={styles.favoriteButtonText}>
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePokemon(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setEditingPokemon(item);
            setNewName(item.name?.english || "");
            setModalVisible(true);
          }}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search Pokémon by name"
      />
      <Button
        title="Fetch and Save Pokémon"
        onPress={fetchAndSavePokemons}
        color="#1E90FF"
      />
      <Button
        title="Create New Pokémon"
        onPress={() => setCreateModalVisible(true)}
        color="#32CD32"
      />
      <FlatList
        data={filteredPokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPokemon}
        contentContainerStyle={styles.listContainer}
      />

      {/* Modal for editing Pokémon name */}
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Pokémon Name</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
            />
            <Button title="Save" onPress={editPokemonName} color="#1E90FF" />
            <Button
              title="Cancel"
              onPress={() => {
                setModalVisible(false);
                setEditingPokemon(null);
                setNewName("");
              }}
              color="#FF4500"
            />
          </View>
        </View>
      </Modal>

      {/* Modal for creating a new Pokémon */}
      <Modal
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Pokémon</Text>
            <TextInput
              style={styles.modalInput}
              value={newPokemonName}
              onChangeText={setNewPokemonName}
              placeholder="Enter Pokémon name"
            />
            <View style={styles.typesContainer}>
              {availableTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedTypes.includes(type) && styles.selectedTypeButton,
                  ]}
                  onPress={() => {
                    setSelectedTypes((prev) =>
                      prev.includes(type)
                        ? prev.filter((t) => t !== type)
                        : [...prev, type]
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedTypes.includes(type) && styles.selectedTypeButtonText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Button title="Create" onPress={createPokemon} color="#32CD32" />
            <Button
              title="Cancel"
              onPress={() => {
                setCreateModalVisible(false);
                setNewPokemonName("");
                setSelectedTypes([]);
              }}
              color="#FF6347"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
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
  favoriteButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  favorited: {
    backgroundColor: "#FF6347",
  },
  notFavorited: {
    backgroundColor: "#1E90FF",
  },
  favoriteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#FF4500",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  editButton: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#32CD32",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 20,
    fontSize: 16,
    padding: 5,
  },
  typesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  typeButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#ffffff",
  },
  selectedTypeButton: {
    backgroundColor: "#1E90FF",
  },
  typeButtonText: {
    color: "#333",
  },
  selectedTypeButtonText: {
    color: "#fff",
  },
});

export default SavePokemons;
