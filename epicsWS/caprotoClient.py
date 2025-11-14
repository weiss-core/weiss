from typing import Callable, Dict, Set, Any
from threading import Lock
import caproto.threading.pyepics_compat as epics


class CaprotoClient:
    """
    Simplified client using caproto.threading.pyepics_compat (PyEpics-compatible).
    Handles per-client subscriptions and forwards raw callback data to the upper layer.
    """

    def __init__(self, handle_update: Callable[[str, Any], None]):
        """
        handle_update: callable(pv_name: str, raw_data: dict)
        """
        self._handle_update = handle_update
        self._pvs: Dict[str, Any] = {}
        self._subscribers: Dict[str, Set[str]] = {}
        self._lock = Lock()

    def _callback(self, value, **kwargs):
        """Generic callback for all PVs — passes raw data upstream."""
        pvname = kwargs.get("pvname")
        if not pvname:
            return
        self._handle_update(pvname, {"value": value, **kwargs})

    def subscribe(self, client_id: str, pv_name: str):
        """
        Subscribe a client to a PV.
        On first subscription, creates the PV and attaches a callback.
        """
        with self._lock:
            first_sub = pv_name not in self._pvs
            self._subscribers.setdefault(pv_name, set()).add(client_id)

        if first_sub:
            try:
                pv = epics.get_pv(pv_name)
                pv.get_ctrlvars()
                pv.add_callback(self._callback)
                self._pvs[pv_name] = pv
            except Exception as e:
                print(f"[caproto]: Failed to subscribe to {pv_name}: {e}")

    def unsubscribe(self, client_id: str, pv_name: str):
        """Unsubscribe a client from a PV."""
        with self._lock:
            clients = self._subscribers.get(pv_name)
            if not clients:
                return

            clients.discard(client_id)
            if not clients:
                pv = self._pvs.pop(pv_name, None)
                self._subscribers.pop(pv_name, None)
                if pv:
                    try:
                        pv.clear_callbacks()
                    except Exception as e:
                        print(f"[caproto]: Failed to clear callbacks for {pv_name}: {e}")

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
            print(f"[caproto]: Cannot write: PV {pv_name} not subscribed.")
            return

        try:
            pv.put(value)
        except Exception as e:
            print(f"[caproto]: Write to {pv_name} failed: {e}")

    def close(self):
        """Stop all subscriptions and clear resources."""
        with self._lock:
            for pv_name, pv in self._pvs.items():
                try:
                    pv.clear_callbacks()
                except Exception as e:
                    print(f"[caproto]: Failed to clear callbacks for {pv_name}: {e}")
            self._pvs.clear()
            self._subscribers.clear()
        print("[caproto]: Closed all subscriptions.")
