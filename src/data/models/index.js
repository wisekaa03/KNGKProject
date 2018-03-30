/**
 * Models
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import sequelize from '../sequelize';

/**
 * Synchronization
 */
function sync(...args) {
  return sequelize.sync(...args);
}

export default { sync };
