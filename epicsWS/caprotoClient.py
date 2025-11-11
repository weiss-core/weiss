from typing import Callable, Dict, Set, Any
from caproto.threading.client import Context
from threading import Lock
import numpy as np


def _to_native(v):
    """Recursively convert NumPy scalars and arrays to native Python types."""

    if isinstance(v, (np.integer, np.floating)):
        return v.item()
    if isinstance(v, (list, tuple)):
        return [_to_native(x) for x in v]
    if isinstance(v, np.ndarray):
        return v.tolist()
    return v


class CaprotoClient:
    """
    Manages PV subscriptions using the caproto threading client.
    Performs one-time control reads and continuous time updates.
    Returns raw response objects to the upper layer.
    """

    def __init__(self, handle_update: Callable[[str, Any], None]):
        """
        handle_update: callable(pv_name: str, raw_data: dict)
        The raw_data will include both 'control' (once) and 'time' fields.
        """
        self._handle_update = handle_update
        self._context = Context()
        self._pvs: Dict[str, Any] = {}
        self._subs: Dict[str, Any] = {}
        self._subscribers: Dict[str, Set[str]] = {}
        self._control_cache: Dict[str, Any] = {}
        self._lock = Lock()

    def _monitor_callback(self, sub, response):
        pv_name = sub.pv.name
        metadata = response.metadata
        ctrl_fields = self._control_cache.get(pv_name)

        # Decode enum strings if present
        enum_strings = getattr(ctrl_fields, "enum_strings", None)
        if enum_strings:
            enum_strings = [
                s.decode() if isinstance(s, (bytes, bytearray)) else str(s) for s in enum_strings
            ]

        # Decode units safely
        units = getattr(ctrl_fields, "units", None)
        if isinstance(units, (bytes, bytearray)):
            units = units.decode()

        # Convert CA value to native type
        raw_value = response.data[0] if len(response.data) == 1 else response.data
        raw_value = _to_native(raw_value)

        raw_data = {
            "pv": pv_name,
            "value": raw_value,
            "timestamp": getattr(metadata, "timestamp", None),
            "status": getattr(metadata, "status", None),
            "severity": getattr(metadata, "severity", None),
            "precision": getattr(ctrl_fields, "precision", None),
            "units": units,
            "enum_strings": enum_strings or None,
            "upper_disp_limit": getattr(ctrl_fields, "upper_disp_limit", None),
            "lower_disp_limit": getattr(ctrl_fields, "lower_disp_limit", None),
            "upper_alarm_limit": getattr(ctrl_fields, "upper_alarm_limit", None),
            "lower_alarm_limit": getattr(ctrl_fields, "lower_alarm_limit", None),
            "upper_warning_limit": getattr(ctrl_fields, "upper_warning_limit", None),
            "lower_warning_limit": getattr(ctrl_fields, "lower_warning_limit", None),
            "upper_ctrl_limit": getattr(ctrl_fields, "upper_ctrl_limit", None),
            "lower_ctrl_limit": getattr(ctrl_fields, "lower_ctrl_limit", None),
        }

        self._handle_update(pv_name, raw_data)

    def subscribe(self, client_id: str, pv_name: str):
        """
        Subscribe a client to a PV.
        On first subscription:
          - Perform one-time control read
          - Start time subscription
        """
        with self._lock:
            first_sub = pv_name not in self._pvs
            self._subscribers.setdefault(pv_name, set()).add(client_id)

        if first_sub:
            print(f"[CaprotoClient] Connecting to {pv_name}...")
            pv, *_ = self._context.get_pvs(pv_name)
            self._pvs[pv_name] = pv

            # Read control info once
            try:
                ctrl_response = pv.read(data_type="control")
                self._control_cache[pv_name] = ctrl_response.metadata
            except Exception as e:
                print(f"[CaprotoClient] Control read failed for {pv_name}: {e}")
                self._control_cache[pv_name] = None

            # Start subscription for updates
            try:
                sub = pv.subscribe(data_type="time")
                sub.add_callback(self._monitor_callback)
                self._subs[pv_name] = sub
            except Exception as e:
                print(f"[CaprotoClient] Failed to subscribe to {pv_name}: {e}")

    def unsubscribe(self, client_id: str, pv_name: str):
        """Unsubscribe a client from a PV."""
        with self._lock:
            clients = self._subscribers.get(pv_name)
            if not clients:
                return

            clients.discard(client_id)
            if not clients:  # no more subscribers for this PV
                print(f"[CaprotoClient] Unsubscribing from {pv_name}")
                sub = self._subs.pop(pv_name, None)
                if sub:
                    try:
                        sub.clear()
                    except Exception as e:
                        print(f"[CaprotoClient] Failed to clear subscription for {pv_name}: {e}")
                self._pvs.pop(pv_name, None)
                self._control_cache.pop(pv_name, None)
                self._subscribers.pop(pv_name, None)

    def unsubscribe_all(self, client_id: str):
        """Remove a client from all subscriptions."""
        with self._lock:
            empty_pvs = [
                pv
                for pv, clients in self._subscribers.items()
                if client_id in clients and len(clients) == 1
            ]

        for pv in empty_pvs:
            self.unsubscribe(client_id, pv)

    def write_to_pv(self, pv_name: str, value: Any):
        """Write synchronously to a PV."""
        with self._lock:
            pv = self._pvs.get(pv_name)
        if not pv:
            print(f"[CaprotoClient] Cannot write: PV {pv_name} not subscribed.")
            return

        try:
            pv.write(value)
        except Exception as e:
            print(f"[CaprotoClient] Write to {pv_name} failed: {e}")

    def close(self):
        """Stop all subscriptions and clear resources."""
        with self._lock:
            for sub in self._subs.values():
                try:
                    sub.unsubscribe()
                except Exception as e:
                    print(f"[CaprotoClient] Failed to unsubscribe: {e}")
            self._subs.clear()
            self._pvs.clear()
            self._subscribers.clear()
            self._control_cache.clear()

        print("[CaprotoClient] Closed all subscriptions.")
