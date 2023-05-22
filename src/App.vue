<script setup>
import { ref } from 'vue';
import $ from 'gogocode';
import CodeArea from './components/codeArea.vue';

// TODO 待移除
const nodeType = {
  ObjectExpression: 'object',
  ObjectProperty: 'object',
  StringLiteral: 'string',
  BooleanLiteral: 'boolean',
  NullLiteral: 'null',
  Identifier: 'identifier',
  NumericLiteral: 'number',
  ArrayExpression: 'array',
  MemberExpression: 'memberExp',
  ThisExpression: 'thisExp',
};

const source = ref(
  `data() {
    return {
      stringData: 'abc',
      booleanData: false, // 布尔值
      // null值
      nullData: null,
      undefinedData: undefined,
      numberData: 42,
      emptyString: '',
      // 这是一个
      // 复杂对象
      complexObject: {
        nullable: null,
        name: 'sechi',
        age: 23,
        address: {
          x: 33,
          y: '44',
        },
        cats: ['mercy', 42, {t: 1}, ['adc', 'jungle']]
      }, // 复杂对象行内注释
      arrayData: [42, 'sechi', null],
      // various variables
      scopeData: this.person.age,
      objectVariable: video.author.name,
      singleVariable: IMPORT_DATA
    }
  }`,
);

const result = ref('');

const transform = () => {
  let transformResult = '';
  try {
    const ast = $(source.value, { isProgram: false });

    const returnVal = ast.find('return $_$1');

    returnVal.match[1][0].node.properties.forEach((item) => {
      const key = item.key.name;

      const type = nodeType[item.value.type];

      const value = type === 'object' || type === 'array'
        ? JSON.stringify(transValue(type, item.value), null, 2)
        : transValue(type, item.value);

      const sentence = `const ${key} = ref(${value});`;

      const comments = handleComment(item.comments);

      if (comments.length > 0) {
        comments.forEach((c, index) => {
          if (c.isLeading) {
            transformResult += `${c.content}\n`;
            // 只存在leading注释
            if (index === comments.length - 1) transformResult += `${sentence}\n`;
          } else {
            transformResult += `${sentence} ${c.content}\n`;
          }
        });
      } else {
        transformResult += `${sentence}\n`;
      }
    });
    result.value = transformResult;
  } catch (err) {
    result.value = err;
    throw new Error(err);
  }
};

const handleComment = (commentsArr) => {
  if (!Array.isArray(commentsArr)) return [];
  const c = [];
  commentsArr.forEach((comment) => {
    const isLeading = comment.leading; // 注释位置在代码上方
    const content = comment.value;
    c.push({ isLeading, content: `//${content}` });
  });
  return c;
};

const transValue = (type, node, isObjProp = false) => {
  const passedTypes = ['number', 'boolean', 'null'];
  if (passedTypes.includes(type)) {
    return node.value;
  }
  if (type === 'string') {
    return isObjProp ? node.value : `"${node.value}"`;
  }
  if (type === 'array') {
    const arr = [];
    node.elements.forEach((el) => {
      const value = transValue(nodeType[el.type], el, true);
      arr.push(value);
    });
    return arr;
  }
  if (type === 'object') {
    // object
    const obj = {};
    node.properties.forEach((property) => {
      const key = property.key.name;
      const value = transValue(
        nodeType[property.value.type],
        property.value,
        true,
      );
      obj[key] = value;
    });
    return obj;
  }
  if (type === 'memberExp') {
    const object = handleMemberExp(node);
    return object;
  }
  if (type === 'identifier') {
    return node.name;
  }
  throw new Error(`unreached type: ${type}. NodeInfo: ${node}`);
};

const handleMemberExp = (node) => {
  let value = '';
  const curObject = node.object;
  if (curObject.type === 'MemberExpression') {
    const headPice = handleMemberExp(curObject);
    const curPiece = `.${node.property.name}`;
    value = headPice + curPiece;
    return value;
  }
  // 根对象
  if (curObject.type === 'ThisExpression') {
    return `this.${node.property.name}`;
  }
  return `${curObject.name}.${node.property.name}`;
};
</script>

<template>
  <div class="min-w-full min-h-full fcc overflow-hidden bg-gray-50">
    <div w-1400px fbc>
      <CodeArea v-model="source" />

      <button
        class="nes-btn is-primary font-semibold font-sans"
        @click="transform"
      >
        transform
      </button>

      <CodeArea v-model="result" />
    </div>
  </div>
</template>

<style scoped></style>
