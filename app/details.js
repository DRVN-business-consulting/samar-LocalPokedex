import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

const Detail = () => {
  const route = useRoute();
  const { pokemon } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{pokemon.name?.english || "Unknown"}</Text>
      <Text style={styles.text}>ID: {pokemon.id}</Text>
      <Text style={styles.text}>Types: {pokemon.type.join(", ")}</Text>
      {pokemon.description && (
        <Text style={styles.text}>Description: {pokemon.description}</Text>
      )}
      {pokemon.height && (
        <Text style={styles.text}>Height: {pokemon.height} m</Text>
      )}
      {pokemon.weight && (
        <Text style={styles.text}>Weight: {pokemon.weight} kg</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    marginBottom: 5,
  },
});

export default Detail;
