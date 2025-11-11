from __future__ import annotations
from typing import Optional, List, Union, Any
from dataclasses import dataclass
import math
import base64
import numpy as np
from p4p.wrapper import Value as p4pValue


# ------------------- Data Structures -------------------


@dataclass
class Alarm:
    severity: int = 0
    status: int = 0
    message: str = "NO_ALARM"


@dataclass
class TimeStamp:
    secondsPastEpoch: int = 0
    nanoseconds: int = 0
    userTag: int = 0


@dataclass
class Display:
    limitLow: Optional[float] = None
    limitHigh: Optional[float] = None
    description: Optional[str] = None
    units: Optional[str] = None
    precision: Optional[int] = None
    form: Optional[str] = None
    choices: Optional[List[str]] = None


@dataclass
class Control:
    limitLow: Optional[float] = None
    limitHigh: Optional[float] = None
    minStep: Optional[float] = None


@dataclass
class ValueAlarm:
    active: Optional[bool] = None
    lowAlarmLimit: Optional[float] = None
    lowWarningLimit: Optional[float] = None
    highWarningLimit: Optional[float] = None
    highAlarmLimit: Optional[float] = None
    lowAlarmSeverity: Optional[int] = None
    lowWarningSeverity: Optional[int] = None
    highWarningSeverity: Optional[int] = None
    highAlarmSeverity: Optional[int] = None
    hysteresis: Optional[int] = None


@dataclass
class PVData:
    pv: Optional[str] = None
    value: Optional[Union[float, int, List[float], List[int], List[str]]] = None
    enumChoices: Optional[List[str]] = None
    alarm: Optional[Alarm] = None
    timeStamp: Optional[TimeStamp] = None
    display: Optional[Display] = None
    control: Optional[Control] = None
    valueAlarm: Optional[ValueAlarm] = None
    b64arr: Optional[str] = None
    b64dtype: Optional[str] = None


# ------------------- Utility -------------------


def encode_base64_array(array: Union[List, np.ndarray], dtype: str) -> str:
    arr = np.asarray(array, dtype=dtype)
    if not arr.dtype.isnative or arr.dtype.byteorder != "<":
        arr = arr.astype("<" + arr.dtype.str[1:])
    return base64.b64encode(arr.tobytes()).decode("ascii")


def encode_array(arr: Any) -> tuple[Optional[str], Optional[str]]:
    """Returns (b64arr, b64dtype) for numeric arrays."""
    if arr is None:
        return None, None

    arr = np.asarray(arr)
    if arr.size == 0:
        return None, None

    if np.issubdtype(arr.dtype, np.floating):
        return encode_base64_array(arr, "float64"), "float64"

    if np.issubdtype(arr.dtype, np.integer):
        min_val, max_val = arr.min(), arr.max()
        if -128 <= min_val <= max_val <= 255:
            dtype = "int8"
        elif -32768 <= min_val <= max_val <= 32767:
            dtype = "int16"
        else:
            dtype = "int32"
        return encode_base64_array(arr, dtype), dtype

    return None, None


# ------------------- Parser -------------------


class PVParser:
    @staticmethod
    def from_p4p(pv_obj, pv_name: Optional[str] = None) -> PVData:
        """Converts a p4p NTValue to PVData."""
        enumChoices = value = b64arr = b64dtype = None

        value_field = pv_obj.get("value")

        # --- Handle value field ---
        if isinstance(value_field, (int, float, str)):
            value = value_field
        elif (
            isinstance(value_field, p4pValue)
            and value_field.has("index")
            and value_field.has("choices")
        ):
            value = value_field.get("index")
            enumChoices = value_field.get("choices")
        elif isinstance(value_field, (list, np.ndarray)):
            b64arr, b64dtype = encode_array(value_field)

        # --- Alarm ---
        a = pv_obj.get("alarm", {})
        alarm = Alarm(
            severity=a.get("severity", 0),
            status=a.get("status", 0),
        )

        # --- Timestamp ---
        ts = pv_obj.get("timeStamp", {})
        timestamp = TimeStamp(
            secondsPastEpoch=ts.get("secondsPastEpoch", 0),
            nanoseconds=ts.get("nanoseconds", 0),
            userTag=ts.get("userTag", 0),
        )

        # --- Display ---
        d = pv_obj.get("display", {})
        display = Display(
            limitLow=d.get("limitLow"),
            limitHigh=d.get("limitHigh"),
            description=d.get("description"),
            units=d.get("units"),
            precision=d.get("precision"),
            form=d.get("form"),
            choices=d.get("choices"),
        )

        # --- Control ---
        c = pv_obj.get("control", {})
        control = Control(
            limitLow=c.get("limitLow"),
            limitHigh=c.get("limitHigh"),
            minStep=c.get("minStep"),
        )

        # --- Value alarm ---
        va = pv_obj.get("valueAlarm", {})

        def safe_get(k: str):
            v = va.get(k)
            return None if isinstance(v, float) and math.isnan(v) else v

        value_alarm = ValueAlarm(
            active=va.get("active"),
            lowAlarmLimit=safe_get("lowAlarmLimit"),
            lowWarningLimit=safe_get("lowWarningLimit"),
            highWarningLimit=safe_get("highWarningLimit"),
            highAlarmLimit=safe_get("highAlarmLimit"),
            lowAlarmSeverity=va.get("lowAlarmSeverity"),
            lowWarningSeverity=va.get("lowWarningSeverity"),
            highWarningSeverity=va.get("highWarningSeverity"),
            highAlarmSeverity=va.get("highAlarmSeverity"),
            hysteresis=va.get("hysteresis"),
        )

        return PVData(
            pv=pv_name,
            value=value,
            enumChoices=enumChoices,
            alarm=alarm,
            timeStamp=timestamp,
            display=display,
            control=control,
            valueAlarm=value_alarm,
            b64arr=b64arr,
            b64dtype=b64dtype,
        )

    @staticmethod
    def from_caproto(pv_obj: dict, pv_name: str) -> PVData:
        """Converts a dict-based CA response to PVData."""
        value = pv_obj.get("value")
        b64arr, b64dtype = (
            encode_array(value) if isinstance(value, (list, np.ndarray)) else (None, None)
        )

        enumChoices = pv_obj.get("enum_strings")

        # --- Alarm ---
        alarm = Alarm(
            severity=pv_obj.get("severity", 0),
            status=pv_obj.get("status", 0),
            message=str(pv_obj.get("status", "NO_ALARM")),
        )

        # --- Timestamp ---
        ts = pv_obj.get("timestamp", 0.0) or 0.0
        sec = int(ts)
        nsec = int((ts - sec) * 1e9)
        timestamp = TimeStamp(secondsPastEpoch=sec, nanoseconds=nsec)

        # --- Display ---
        display = Display(
            limitLow=pv_obj.get("lower_disp_limit"),
            limitHigh=pv_obj.get("upper_disp_limit"),
            units=pv_obj.get("units"),
            precision=pv_obj.get("precision"),
            choices=pv_obj.get("enum_strings"),
        )

        # --- Control ---
        control = Control(
            limitLow=pv_obj.get("lower_ctrl_limit"),
            limitHigh=pv_obj.get("upper_ctrl_limit"),
        )

        # --- Value alarm ---
        value_alarm = ValueAlarm(
            lowAlarmLimit=pv_obj.get("lower_alarm_limit"),
            highAlarmLimit=pv_obj.get("upper_alarm_limit"),
            lowWarningLimit=pv_obj.get("lower_warning_limit"),
            highWarningLimit=pv_obj.get("upper_warning_limit"),
            hysteresis=pv_obj.get("hyst"),
        )

        return PVData(
            pv=pv_name,
            value=value,
            enumChoices=enumChoices,
            alarm=alarm,
            timeStamp=timestamp,
            display=display,
            control=control,
            valueAlarm=value_alarm,
            b64arr=b64arr,
            b64dtype=b64dtype,
        )
