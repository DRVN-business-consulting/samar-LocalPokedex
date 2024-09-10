import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { encryptPassword, decryptPassword } from "./encrypt"; // Adjust path as needed

export default function App() {
  const [password, setPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [bg, setBg] = useState(styles.backGroundLight.backgroundColor);
  const [fc, setFc] = useState(styles.fontLight.color);
  const [validationMessage, setValidationMessage] = useState("");

  const router = useRouter(); // Use the router hook

  useEffect(() => {
    // Check for password validity
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);

    if (hasUpperCase && hasLowerCase) {
      setPasswordStatus("Password is valid");
    } else {
      setPasswordStatus(
        "Password must include an uppercase letter and a lowercase letter."
      );
    }

    // Retrieve stored password on mount
    const getStoredPassword = async () => {
      try {
        const encryptedPassword = await SecureStore.getItemAsync("password");
        if (encryptedPassword) {
          const decryptedPassword = decryptPassword(encryptedPassword);
          console.log("Decrypted Password:", decryptedPassword);
        } else {
          console.log("No password stored");
        }
      } catch (error) {
        console.error("Error retrieving password", error);
      }
    };

    getStoredPassword();
  }, [password]);

  const validateInputs = async () => {
    const isPasswordValid = passwordStatus === "Password is valid";

    if (isPasswordValid) {
      try {
        // Encrypt and store the password
        const encryptedPassword = encryptPassword(password);
        await SecureStore.setItemAsync("password", encryptedPassword);
        router.push("/pokemon"); // Navigate to /pokemon screen
      } catch (error) {
        console.error("Error storing password", error);
        setValidationMessage("Error storing password.");
      }
    } else {
      setValidationMessage("Failure! Please check your password.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style="auto" />
      <Text style={[styles.text, { color: "black" }]}>Login</Text>
      <TextInput
        placeholder="Password"
        style={[styles.input, { color: "black" }]}
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <Text
        style={[
          styles.label,
          { left: 0, marginRight: 70, marginLeft: 70, color: "black" },
        ]}
      >
        {passwordStatus}
      </Text>

      <TouchableOpacity style={styles.btnLogin} onPress={validateInputs}>
        <Text style={[styles.btnText, { color: fc }]}>Login</Text>
      </TouchableOpacity>
      <Text
        style={[
          styles.label,
          {
            left: 20,
            marginRight: 60,
            marginLeft: 20,
            alignContent: "center",
            textAlign: "center",
            color: fc,
          },
        ]}
      >
        {validationMessage}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginBottom: 20,
    fontSize: 32,
    fontWeight: "bold",
  },
  btnLogin: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: -5,
    width: 250,
    height: 50,
  },
  input: {
    margin: 1,
    width: 250,
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 1,
  },
  fontMonkey: {
    fontSize: 80,
  },
  backGroundDark: {
    backgroundColor: "#292a2b",
  },
  backGroundLight: {
    backgroundColor: "#dcdee0",
  },
  fontLight: {
    color: "#fff",
  },
  fontDark: {
    color: "#000",
  },
  label: {
    fontSize: 12,
    marginBottom: 15,
    color: "#333",
    right: 90,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
  },
});
