'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        const timestampColumns = {
          created_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        };

        await queryInterface.createTable(
          'users',
          {
            id: {
              type: Sequelize.UUID,
              defaultValue: Sequelize.UUIDV4,
              allowNull: false,
              primaryKey: true,
            },
            username: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
            },
            password: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            otp: {
              type: Sequelize.STRING,
            },
            verification_token: {
              type: Sequelize.TEXT,
            },
            is_verified: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
            ...timestampColumns,
          },
          { transaction },
        );

        await queryInterface.createTable(
          'auth_leads',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              allowNull: false,
              primaryKey: true,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            username: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            password: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            otp: {
              type: Sequelize.STRING,
            },
            verification_token: {
              type: Sequelize.TEXT,
            },
            ...timestampColumns,
          },
          { transaction },
        );

        await queryInterface.createTable(
          'files',
          {
            id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              allowNull: false,
              primaryKey: true,
            },
            key: {
              type: Sequelize.TEXT,
              allowNull: false,
            },
            url: {
              type: Sequelize.TEXT,
              allowNull: false,
            },
            user_id: {
              type: Sequelize.UUID,
              allowNull: false,
              references: {
                model: 'users',
                key: 'id',
              },
              onUpdate: 'CASCADE',
              onDelete: 'CASCADE',
            },
            is_signed: {
              type: Sequelize.BOOLEAN,
              allowNull: false,
              defaultValue: false,
            },
            expiry_time: {
              type: Sequelize.DATE,
              allowNull: true,
            },
            ...timestampColumns,
          },
          { transaction },
        );
      } catch (error) {
        Logger.log('Error in migration', error);
        throw error;
      }
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      try {
        await queryInterface.dropTable('files', { transaction });

        await queryInterface.dropTable('auth_leads', { transaction });

        await queryInterface.dropTable('users', { transaction });
      } catch (error) {
        Logger.log('Error in migration rollback', error);
        throw error;
      }
    });
  },
};
