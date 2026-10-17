import assert from "node:assert/strict";
import test from "node:test";
import {
  composeConsultationMessage,
  resolveConsultationArea,
} from "../src/lib/consultation-context.ts";

const areas = ["ged", "programming", "digital", "making"];
test("相談分野は公開された4領域だけをqueryから選び、未知値は未定に戻す", () => {
  for (const area of areas)
    assert.equal(resolveConsultationArea(area, areas), area);
  for (const unknown of [
    null,
    "",
    "constructor",
    "<script>",
    "GED",
    "digital&service=other",
  ]) {
    assert.equal(resolveConsultationArea(unknown, areas), "");
  }
});
test("コピー文は現在選んだ分野と編集メモを含む", () => {
  const details = "Excelの表を作れるようになりたい。\n使っているPC：Windows";
  const text = composeConsultationMessage(
    "Acecore Schoolsへの相談",
    "相談したい分野：",
    "PC・スマホ活用",
    details,
  );
  assert.equal(
    text,
    "Acecore Schoolsへの相談\n相談したい分野：PC・スマホ活用\n\n" + details,
  );
});
test("分野変更時も、メモの内容・改行・空白を変えない", () => {
  const details = "  自分の言葉で書いたメモ\n2行目\n";
  const before = composeConsultationMessage(
    "相談",
    "分野：",
    "IT学習",
    details,
  );
  const after = composeConsultationMessage(
    "相談",
    "分野：",
    "高卒認定",
    details,
  );
  assert.ok(before.endsWith(details));
  assert.ok(after.endsWith(details));
  assert.ok(!after.includes("IT学習"));
});
test("未定・複数の分野でも同じ相談文を使える", () => {
  assert.equal(
    composeConsultationMessage("相談", "分野：", "未定・複数の分野", ""),
    "相談\n分野：未定・複数の分野\n\n",
  );
});
