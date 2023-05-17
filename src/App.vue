<script setup>
import { ref } from 'vue';
import $ from 'gogocode';

const nodeType = {
  ObjectExpression: 'object',
  ObjectProperty: 'object',
  StringLiteral: 'string',
  BooleanLiteral: 'boolean',
  NullLiteral: 'null',
  Identifier: 'undefined',
  NumericLiteral: 'number',
  ArrayExpression: 'array',
};

const source = ref(`
  function data() {
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
      arrayData: [42, 'sechi', null]
    }
  }
`);

const result = ref('');

const transform = () => {
  const ast = $(source.value, { isProgram: false });

  const returnVal = ast.find('function data() { return $_$1 }');

  let transformResult = '';

  returnVal.match[1][0].node.properties.forEach((item) => {
    const key = item.key.name;

    const type = nodeType[item.value.type];

    const value = type === 'object' || type === 'array' ? JSON.stringify(transValue(type, item.value), null, 2) : transValue(type, item.value);

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
  const passedTypes = ['number', 'boolean', 'null', 'undefined'];
  if (passedTypes.includes(type)) {
    return node.value;
  } if (type === 'string') {
    return isObjProp ? node.value : `"${node.value}"`;
  } if (type === 'array') {
    const arr = [];
    node.elements.forEach((el) => {
      const value = transValue(nodeType[el.type], el, true);
      arr.push(value);
    });
    return arr;
  } if (type === 'object') {
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
  throw new Error(`unreached type: ${type}. NodeInfo: ${node}`);
};
</script>

<template>
  <div class="w-1200px h-screen flex justify-between items-center">
    <div>
      <textarea v-model="source" cols="50" rows="60"></textarea>
    </div>

    <button class="btn" @click="transform">transform</button>

    <div>
      <textarea v-model="result" cols="50" rows="60"></textarea>
    </div>
  </div>
</template>

<style scoped></style>
