"use client";

import { useCallback, useEffect, useState } from "react";

export interface AudioDevice {
  deviceId: string;
  label: string;
  groupId: string;
}

export interface AudioDevicesHook {
  availableDevices: AudioDevice[];
  selectedDeviceId: string;
  setSelectedDevice: (deviceId: string) => void;
}

export const useAudioDevices = (): AudioDevicesHook => {
  const [availableDevices, setAvailableDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const getAudioDevices = useCallback(async () => {
    try {
      // First, request basic permissions to get device labels
      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      tempStream.getTracks().forEach((track) => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((device) => device.kind === "audioinput")
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId,
        }));

      console.log("Available audio devices:", audioInputs);
      setAvailableDevices(audioInputs);

      setSelectedDeviceId((currentId) => {
        if (currentId && audioInputs.find((d) => d.deviceId === currentId)) {
          return currentId;
        }
        return audioInputs.length > 0 ? audioInputs[0].deviceId : "";
      });
    } catch (error) {
      console.error("Error getting audio devices:", error);
      setAvailableDevices([]);
      setSelectedDeviceId("");
    }
  }, []);

  useEffect(() => {
    getAudioDevices();

    navigator.mediaDevices.addEventListener("devicechange", getAudioDevices);
    return () => {
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        getAudioDevices
      );
    };
  }, [getAudioDevices]);

  const setSelectedDevice = useCallback((deviceId: string) => {
    console.log("Selected audio device:", deviceId);
    setSelectedDeviceId(deviceId);
  }, []);

  return { availableDevices, selectedDeviceId, setSelectedDevice };
};
