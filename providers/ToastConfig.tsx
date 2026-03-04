import COLORS from "@/constants/colors";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

const fontStyles = {
  fontSize: 16,
  fontWeight: undefined,
  fontFamily: "NunitoSemibold",
  color: "#fff",
};
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      renderLeadingIcon={() => (
        <Feather name="check-circle" size={24} color="white" />
      )}
      style={{
        backgroundColor: COLORS.primary_400,
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 14,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        width: "70%",
      }}
      text1Style={[
        props.text1Style,
        {
          ...fontStyles,
        },
      ]}
      text2Style={{
        fontSize: 12,
        fontFamily: "DegularMedium",
        color: "#fff",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      renderLeadingIcon={() => (
        <MaterialIcons name="error" size={24} color="white" />
      )}
      style={{
        backgroundColor: "#D32F2F",
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 14,
        borderLeftWidth: 0,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        width: "70%",
      }}
      text1Style={[
        props.text1Style,
        {
          ...fontStyles,
        },
      ]}
      text2Style={{
        fontSize: 12,
        fontFamily: "NunitoRegular",
        color: "#fff",
      }}
    />
  ),

  info: (props) => (
    <BaseToast
      {...props}
      renderLeadingIcon={() => (
        <Entypo name="info" size={24} color={COLORS.primary_400} />
      )}
      style={{
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 15,
      }}
      contentContainerStyle={{ paddingHorizontal: 15, width: "70%" }}
      text1Style={[
        props.text1Style,
        {
          ...fontStyles,
          color: COLORS.primary_400,
        },
      ]}
      text2Style={{
        fontSize: 12,
        fontFamily: "NunitoRegular",
      }}
    />
  ),
};

export default toastConfig;
