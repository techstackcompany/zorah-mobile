import COLORS from "@/constants/colors";
import { Entypo, Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { BaseToast, ErrorToast, ToastConfig } from "react-native-toast-message";

const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      renderLeadingIcon={() => (
       <Feather name="check-circle"  size={24} color="white" />
      )}
      style={{
        backgroundColor: COLORS.primary_400, 
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 14,
      }}
      contentContainerStyle={{ paddingHorizontal: 15, width: "70%" }}
      text1Style={[
        props.text1Style,
        {
          fontSize: 16,
          fontFamily: "LoraSemiBold",
          fontWeight:'600',
          color: "#fff",
        },
      ]}
      text2Style={{
        fontSize: 12,
        fontFamily: "LoraSemiBold",
        color: "#fff",
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      renderLeadingIcon={() => (
      <MaterialIcons name="error" size={24} color="black" />
      )}
      style={{
        backgroundColor: "#D32F2F",
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 14,
      }}
      text1Style={[
        props.text1Style,
        {
          fontSize: 16,
          fontWeight:'600',
          fontFamily: "LoraSemiBold",
          color: "#fff",
        },
      ]}
      text2Style={{
        fontSize: 12,
        fontFamily: "LoraSemiBold",
        color: "#fff",
      }}
    />

  ),

  info: (props) => ( <BaseToast
      {...props}
      renderLeadingIcon={() => (
        <Entypo name="info" size={24} color={COLORS.primary} />
      )}
      style={{
        width: "100%",
        borderRadius: 8,
        alignItems: "center",
        paddingHorizontal: 14,
       
      }}
      contentContainerStyle={{ paddingHorizontal: 15, width: "70%" }}
      text1Style={[
        props.text1Style,
        {
          fontSize: 16,
          fontFamily: "LoraSemiBold",
          fontWeight:'600',
        },
      ]}
      text2Style={{
        fontSize: 12,
        fontFamily: "LoraSemiBold",
      }}
    /> )
};

export default toastConfig;
