import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import httpx
from langchain_openai import ChatOpenAI

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ai"))
sys.path.insert(0, str(ROOT / "scripts"))
previous = Path.cwd()
try:
    os.chdir(ROOT / "ai")
    import enhance
finally:
    os.chdir(previous)
import topic_filter


class ClientCaptured(Exception):
    pass


class DeepSeekClientConfigTest(unittest.TestCase):
    def test_openai_sdk_sends_flash_thinking_control(self):
        def respond(request):
            self.assertEqual(str(request.url), "https://api.deepseek.com/v1/chat/completions")
            payload = json.loads(request.content)
            self.assertEqual(payload["model"], "deepseek-flash")
            self.assertEqual(payload["thinking"], {"type": "disabled"})
            self.assertNotIn("reasoning_effort", payload)
            return httpx.Response(200, json={
                "id": "test", "object": "chat.completion", "created": 0,
                "model": "deepseek-flash", "choices": [{"index": 0,
                    "message": {"role": "assistant", "content": "ok"},
                    "finish_reason": "stop"}],
            })

        with httpx.Client(transport=httpx.MockTransport(respond)) as client:
            llm = ChatOpenAI(model="deepseek-flash", api_key="test-placeholder-not-a-real-key",
                             base_url="https://api.deepseek.com/v1", http_client=client,
                             extra_body={"thinking": {"type": "disabled"}})
            self.assertEqual(llm.invoke("test").content, "ok")

    def assert_clients(self, env, expected):
        with tempfile.TemporaryDirectory() as directory:
            data = Path(directory) / "papers.jsonl"
            data.write_text("", encoding="utf-8")
            for module in (enhance, topic_filter):
                with self.subTest(client=module.__name__):
                    settings = {"MODEL_NAME": expected["model"], "TOPIC_FILTER_ENABLED": "true", **env}
                    with patch.dict(os.environ, settings, clear=True), \
                         patch.object(module, "ChatOpenAI", side_effect=ClientCaptured) as client, \
                         patch.object(sys, "argv", ["topic_filter.py", "--data", str(data)]):
                        with self.assertRaises(ClientCaptured):
                            if module is enhance:
                                enhance.process_all_items([], expected["model"], "Chinese", 1)
                            else:
                                topic_filter.main()
                        client.assert_called_once_with(**expected)

    def test_flash_disables_thinking_by_default(self):
        self.assert_clients({"REASONING_EFFORT": "medium"}, {
            "model": "deepseek-flash",
            "extra_body": {"thinking": {"type": "disabled"}},
        })

    def test_flash_can_enable_thinking(self):
        self.assert_clients({"DEEPSEEK_THINKING": "enabled", "REASONING_EFFORT": "low"}, {
            "model": "deepseek-flash",
            "extra_body": {"thinking": {"type": "enabled"}},
            "reasoning_effort": "low",
        })

    def test_other_providers_keep_their_existing_parameters(self):
        self.assert_clients({"REASONING_EFFORT": "medium"}, {
            "model": "another-model", "reasoning_effort": "medium",
        })


if __name__ == "__main__":
    unittest.main()
