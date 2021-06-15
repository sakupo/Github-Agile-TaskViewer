# GitHub-Agile-TaskViewer
[chrome webstore - GitHub-Agile-TaskViewer](https://chrome.google.com/webstore/detail/github-agile-taskviewer/nhebljkbdjblnjlmocfdohhiiccpipja)

GitHub ProjectsのKanbanをストーリーポイントやタグ付け等によってよりアジャイル仕様にする拡張機能です．

## 使い方/How to use
- Github Projectsを作成します．
- タグを作成するには`Backlog`という名前を含むcolumnにcardを以下の形式で追加します．
  ```
  [TagName.] TagDescription
  ```
  例えば，
  ```
  [1.] 説明1
  ```
  というcardを作成した場合，「1」というタグ名が設定されます．(「説明1」というタグの説明がつきます)  
  このとき，タグ名は全タグ中で一意でなければならず，TagNameに空白を含んではいけません．

- これからするべきタスクを作成するには`To do`という名前を含むcolumnにcardを以下の形式で追加します．
  ```
  [Npt][TagName.] Task
  ```
  例えば，
  ```
  [3pt] [1.] タスク1
  ```
  というcardを作成した場合，ストーリーポイントが「3」ポイントの「1」というタグに分類されたタスクが設定されます．  
  このとき，[Npt]を省略した場合，「1」ポイントが設定されます．  
  また，[TagName.]を省略した場合，「No tags」というタグに分類されます．  
  
- 実行中タスクを作成するには`In progress`という名前を含むcolumnにcardを追加します．形式は`To do`の場合と同様です．
- 完了したタスクを作成するには`Done`という名前を含むcolumnにcardを追加します．形式は`To do`の場合と同様です．

## 仕様
- Github Projectのprogress barがストーリーポイントをもとに作成されます．
- 拡張機能アイコンをクリックするとタグ別にタスク一覧を表示します．
- ストーリーポイントの計算には数秒かかることがあります．
